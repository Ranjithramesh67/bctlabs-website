import { NextResponse } from "next/server";
import { z } from "zod";
import { publicOrigin } from "@/lib/app-url";
import { createAddress } from "@/lib/addresses";
import { getCart, writeCart } from "@/lib/cart";
import { createOrder, setOrderMeta, updateOrderStatus } from "@/lib/orders";
import { computeTotals, type CartItem } from "@/lib/pricing";
import { getSession } from "@/lib/session";
import { getStoreSettings } from "@/lib/settings";
import { getProductsByIds } from "@/lib/store";
import {
  createCashfreeOrder,
  isCashfreeConfigured,
  isCashfreeMockEnabled,
  isCashfreeProduction,
  mockPaymentSession,
} from "@/lib/cashfree";

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
  saveAddress: z.boolean().optional().default(false),
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

  const { billing, shipping, paymentMethod, customerNote, saveAddress } = parsed.data;
  const payment = PAYMENT_METHODS[paymentMethod];

  // CASHFREE_MOCK is an explicit local opt-in, so it also wins over a live key
  // pair. It is ignored in production builds.
  const mockCashfree = paymentMethod === "cashfree" && isCashfreeMockEnabled();
  if (paymentMethod === "cashfree" && !isCashfreeConfigured() && !mockCashfree) {
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

    // Re-validate every line server-side: a stale cart could otherwise sell a
    // quote-only (price 0) or out-of-stock product.
    const blocked = lines.find((line) => {
      const product = byId.get(line.productId);
      return !product || !(product.price > 0) || product.stockStatus === "outofstock";
    });
    if (blocked) {
      const name = byId.get(blocked.productId)?.name ?? "An item";
      return NextResponse.json(
        { error: `${name} is no longer available. Please review your cart.` },
        { status: 409 },
      );
    }

    const items: CartItem[] = lines.map((line) => ({
      ...byId.get(line.productId)!,
      quantity: line.quantity,
    }));

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

    const persistAddress = async () => {
      if (!saveAddress || !session.customerId) return;
      try {
        await createAddress(session.customerId, {
          label: "Delivery",
          firstName: billing.firstName,
          lastName: billing.lastName,
          company: billing.company ?? "",
          address1: billing.address1,
          address2: billing.address2 ?? "",
          city: billing.city,
          state: billing.state,
          postcode: billing.postcode,
          country: billing.country,
          phone: billing.phone,
          isDefault: false,
        });
      } catch (error) {
        // The order is already valid; saving the address is a convenience.
        console.error("Failed to save checkout address", error);
      }
    };

    if (paymentMethod === "cod") {
      await writeCart([]);
      await persistAddress();
      return NextResponse.json({ id, key });
    }

    if (paymentMethod === "cashfree" && mockCashfree) {
      return NextResponse.json({
        id,
        key,
        payment: {
          provider: "cashfree" as const,
          sessionId: mockPaymentSession(id),
          cfOrderId: `mock-${id}`,
          mode: "sandbox" as const,
          mock: true,
        },
      });
    }

    // Online payment: create the Cashfree order now and hand the payment
    // session back to the browser. The cart is only cleared once Cashfree
    // confirms the payment (return page or webhook).
    const appUrl = publicOrigin(request);
    if (isCashfreeProduction() && !appUrl.startsWith("https://")) {
      await failOrder(id, "Cashfree production requires a public HTTPS site URL");
      return NextResponse.json(
        {
          error:
            "Online payment is unavailable from this address. Please choose cash on delivery or open the site over HTTPS.",
        },
        { status: 503 },
      );
    }

    try {
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
      await persistAddress();

      return NextResponse.json({
        id,
        key,
        payment: {
          provider: "cashfree" as const,
          sessionId: cfOrder.payment_session_id,
          cfOrderId: String(cfOrder.cf_order_id),
          mode: isCashfreeProduction() ? ("production" as const) : ("sandbox" as const),
        },
      });
    } catch (error) {
      // Do not leave a pending order behind when the gateway session fails.
      console.error("Cashfree session creation failed", error);
      await failOrder(id, error instanceof Error ? error.message : String(error));
      return NextResponse.json(
        {
          error:
            "We could not start the online payment. Please try again or choose cash on delivery.",
        },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("Failed to create order", error);
    return NextResponse.json(
      { error: "We could not place your order. Please try again." },
      { status: 500 },
    );
  }
}

async function failOrder(id: number, reason: string): Promise<void> {
  await Promise.all([
    updateOrderStatus(id, "failed"),
    setOrderMeta(id, "_payment_error", reason.slice(0, 500)),
  ]).catch((error) => console.error("Failed to mark order as failed", id, error));
}
