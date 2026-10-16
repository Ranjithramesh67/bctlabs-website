import { NextResponse } from "next/server";
import { markOrderPaid, setOrderMeta } from "@/lib/orders";
import { verifyWebhookSignature } from "@/lib/cashfree";

/**
 * Cashfree webhook receiver.
 *
 * Configure the URL (e.g. `https://bctlabs.com/api/payments/cashfree/webhook`)
 * in the Cashfree dashboard so payments are confirmed even if the customer
 * closes the browser before returning to the store.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature") ?? "";
  const timestamp = request.headers.get("x-webhook-timestamp") ?? "";

  if (!verifyWebhookSignature(rawBody, timestamp, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    type?: string;
    data?: {
      order?: { order_id?: string };
      payment?: {
        cf_payment_id?: number | string;
        payment_status?: string;
        payment_amount?: number;
        payment_method?: Record<string, unknown> | string;
      };
    };
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const cfOrderId = payload.data?.order?.order_id ?? "";
  const orderId = /^bct-(\d+)$/.exec(cfOrderId)?.[1];
  if (!orderId) {
    // Nothing we can act on; acknowledge so Cashfree stops retrying.
    return NextResponse.json({ ok: true, ignored: true });
  }

  const payment = payload.data?.payment;
  try {
    await setOrderMeta(Number(orderId), "_cashfree_payment_status", payment?.payment_status ?? "");
    if (payment?.payment_status === "SUCCESS") {
      const method =
        typeof payment.payment_method === "string"
          ? payment.payment_method
          : Object.keys(payment.payment_method ?? {})[0] ?? "cashfree";
      await markOrderPaid(Number(orderId), {
        transactionId: String(payment.cf_payment_id ?? ""),
        paymentMethod: `cashfree_${method}`,
        paymentTitle: "Cashfree (online payment)",
      });
    }
  } catch (error) {
    console.error("Cashfree webhook handling failed", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
