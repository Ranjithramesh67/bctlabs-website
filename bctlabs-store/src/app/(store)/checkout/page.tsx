import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { ButtonLink, Container, EmptyState } from "@/components/ui";
import { getCart } from "@/lib/cart";
import { getCustomerById } from "@/lib/customers";
import { isCashfreeAvailable, isCashfreeConfigured, isCashfreeMockEnabled } from "@/lib/cashfree";
import { defaultItemWeightGrams, isNimbusPostConfigured } from "@/lib/nimbuspost";
import { computeTotals, type CartItem } from "@/lib/pricing";
import { getSession } from "@/lib/session";
import { getStoreSettings } from "@/lib/settings";
import { getProductsByIds } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [lines, settings, session] = await Promise.all([getCart(), getStoreSettings(), getSession()]);
  const customer = session.customerId ? await getCustomerById(session.customerId) : null;

  if (!lines.length) {
    return (
      <Container className="py-10">
        <EmptyState
          title="Your cart is empty"
          description="Add a few components to your cart before heading to checkout."
          action={<ButtonLink href="/shop">Browse products</ButtonLink>}
        />
      </Container>
    );
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
    return (
      <Container className="py-10">
        <EmptyState
          title="Your cart is empty"
          description="The items in your cart are no longer available. Please pick something else."
          action={<ButtonLink href="/shop">Browse products</ButtonLink>}
        />
      </Container>
    );
  }

  const totals = computeTotals(items, settings);
  const weightGrams = Math.max(
    1,
    items.reduce((sum, item) => sum + item.quantity * defaultItemWeightGrams(), 0),
  );

  return (
    <Container className="py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Checkout</h1>
        <p className="mt-1 text-sm text-slate-500">
          You have {totals.count} {totals.count === 1 ? "item" : "items"} ready to order.
        </p>
      </div>
      <CheckoutForm
        items={items}
        totals={totals}
        customer={customer}
        cashfreeEnabled={isCashfreeAvailable()}
        cashfreeMock={isCashfreeMockEnabled() && !isCashfreeConfigured()}
        logisticsEnabled={isNimbusPostConfigured()}
        weightGrams={weightGrams}
      />
    </Container>
  );
}
