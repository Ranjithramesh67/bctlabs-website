import { CartView } from "@/components/cart-view";
import { Container } from "@/components/ui";
import { getCart } from "@/lib/cart";
import { computeTotals } from "@/lib/pricing";
import type { CartItem } from "@/lib/pricing";
import { getStoreSettings } from "@/lib/settings";
import { getProductsByIds } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const [lines, settings] = await Promise.all([getCart(), getStoreSettings()]);
  const products = await getProductsByIds(lines.map((l) => l.productId));

  const quantityByProduct = new Map(lines.map((l) => [l.productId, l.quantity]));
  const items: CartItem[] = products.map((product) => ({
    ...product,
    quantity: quantityByProduct.get(product.id) ?? 1,
  }));

  const totals = computeTotals(items, settings);

  return (
    <Container className="py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Shopping cart</h1>
        <p className="mt-1 text-sm text-slate-500">Review your items before checkout.</p>
      </div>
      <CartView items={items} totals={totals} taxLabel={settings.taxLabel} />
    </Container>
  );
}
