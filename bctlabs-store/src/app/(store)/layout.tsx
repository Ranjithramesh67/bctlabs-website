import { CartProvider } from "@/components/cart-provider";
import { StoreHeader } from "@/components/store-header";
import { StoreFooter } from "@/components/store-footer";
import { getCart } from "@/lib/cart";
import { getCustomerById } from "@/lib/customers";
import { getSession } from "@/lib/session";
import { getStoreSettings } from "@/lib/settings";
import { getCategories } from "@/lib/store";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [categories, settings, cart, session] = await Promise.all([
    getCategories(),
    getStoreSettings(),
    getCart(),
    getSession(),
  ]);
  const customer = session.customerId ? await getCustomerById(session.customerId) : null;

  return (
    <CartProvider initialLines={cart}>
      <div className="flex min-h-screen flex-col bg-[#f7f5f9]">
        <StoreHeader
          storeName={settings.name}
          categories={categories}
          customerName={customer?.displayName}
        />
        <main className="flex-1">{children}</main>
        <StoreFooter categories={categories} settings={settings} />
      </div>
    </CartProvider>
  );
}
