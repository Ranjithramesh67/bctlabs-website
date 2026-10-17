import { NextResponse } from "next/server";
import { z } from "zod";
import { getCart, writeCart } from "@/lib/cart";
import { createOrder, setOrderMeta } from "@/lib/orders";
import { computeTotals, type CartItem } from "@/lib/pricing";
import { getSession } from "@/lib/session";
import { getStoreSettings } from "@/lib/settings";
import { getProductsByIds } from "@/lib/store";
import { createCashfreeOrder, isCashfreeConfigured } from "@/lib/cashfree";

const billingSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  company: z.string().trim().optional().default(""),
  address1: z.string().trim().min(1, "Address is required"),
  address2: z.string().trim().optional().default(""),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  postcode: z.string().trim().min(1, "Postcode is required"),
  country: z.string().trim().min(1, "Country is required").default("IN"),
  email: z.email("Enter a valid email address"),
  phone: z.string().trim().min(1, "Phone is required"),
});

const shippingSchema = billingSchema.omit({ email: true, phone: true });

const bodySchema = z.object({
  billing: billingSchema,
  shipping: shippingSchema.optional(),
  paymentMethod: z.enum(["cod", "cashfree"]),
  customerNote: z.string().trim().max(2000).optional().default(""),
});

const PAYMENT_METHODS: Record<"cod" | "cashfree", { title: string; status: string }> = {
  cod: { title: "Cash on delivery", status: "processing" },
  cashfree: { title: "Cashfree (online payment)", status: "pending" },
};

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  if (raw === null || typeof raw !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fields[key]) fields[key] = issue.message;
    }
    return NextResponse.json(
      { error: "Please correct the highlighted fields.", fields },
      { status: 422 },
    );
  }

  const { billing, shipping, paymentMethod, customerNote } = parsed.data;
  const payment = PAYMENT_METHODS[paymentMethod];

  if (paymentMethod === "cashfree" && !isCashfreeConfigured()) {
    return NextResponse.json(
      { error: "Online payment is not available right now. Please choose cash on delivery." },
      { status: 503 },
    );
  }

  try {
    // Never trust client-supplied prices or totals: the cart is the source of truth.
    const [lines, settings, session] = await Promise.all([getCart(), getStoreSettings(), getSession()]);
    if (!lines.length) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const products = await getProductsByIds(lines.map((line) => line.productId));
    const byId = new Map(products.map((product) => [product.id, product]));
    const items: CartItem[] = lines
      .map((line) => {
        const product = byId.get(line.productId);
        return product ? { ...product, quantity: line.quantity } : null;
      })
      .filter((item): item is CartItem => item !== null);

    if (!items.length) {
      return NextResponse.json(
        { error: "None of the items in your cart are available anymore." },
        { status: 400 },
      );
    }

    const totals = computeTotals(items, settings);

    const { id, key } = await createOrder({
      billing,
      shipping: shipping ?? undefined,
      items: items.map((item) => ({
        productId: item.id,
        name: item.name,
        sku: item.sku || undefined,
        quantity: item.quantity,
        price: item.price,
      })),
      paymentMethod,
      paymentTitle: payment.title,
      subtotal: totals.subtotal,
      taxTotal: totals.tax,
      shippingTotal: totals.shipping,
      discountTotal: totals.discount,
      total: totals.total,
      customerId: session.customerId ?? null,
      customerNote: customerNote || undefined,
      status: payment.status,
    });

    if (paymentMethod === "cod") {
      await writeCart([]);
      return NextResponse.json({ id, key });
    }

    // Online payment: create the Cashfree order now and hand the payment
    // session back to the browser. The cart is only cleared once Cashfree
    // confirms the payment (return page or webhook).
    const appUrl = (process.env.APP_URL ?? new URL(request.url).origin).replace(/\/+$/, "");
    const returnUrl = `${appUrl}/checkout/cashfree/return?order=${id}&key=${encodeURIComponent(key)}`;
    const cfOrder = await createCashfreeOrder({
      orderId: `bct-${id}`,
      amount: totals.total,
      customerId: session.customerId ? `cust-${session.customerId}` : `guest-${billing.email}`,
      customerEmail: billing.email ?? "",
      customerPhone: billing.phone ?? "",
      returnUrl,
      notifyUrl: `${appUrl}/api/webhooks/cashfree`,
      note: `BCTLABS order #${id}`,
    });

    await setOrderMeta(id, "_cashfree_order_id", String(cfOrder.cf_order_id));
    await setOrderMeta(id, "_cashfree_order_status", cfOrder.order_status);

    return NextResponse.json({
      id,
      key,
      payment: {
        provider: "cashfree" as const,
        sessionId: cfOrder.payment_session_id,
        cfOrderId: String(cfOrder.cf_order_id),
        mode: (process.env.CASHFREE_ENV ?? "sandbox").toLowerCase() === "production" ? "production" : "sandbox",
      },
    });
  } catch (error) {
    console.error("Failed to create order", error);
    return NextResponse.json(
      { error: "We could not place your order. Please try again." },
      { status: 500 },
    );
  }
}
