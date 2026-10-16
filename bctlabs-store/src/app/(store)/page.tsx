import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ButtonLink, Container } from "@/components/ui";
import { getCategories, getFeaturedProducts, getProducts } from "@/lib/store";
import { getStoreSettings } from "@/lib/settings";

export default async function HomePage() {
  const [categories, featured, latest, settings] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getProducts({ sort: "newest", perPage: 8 }),
    getStoreSettings(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-ink-900 via-brand-800 to-brand-600 text-white">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_60%,white,transparent_30%)]" />
        <Container className="relative grid gap-10 py-20 lg:grid-cols-2 lg:items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              Electronic components &amp; STEM kits
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              Everything you need to build, prototype and learn.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-white/80">
              Microcontrollers, sensors, drivers, displays and power modules - curated for makers,
              students and industry. Fast dispatch with GST invoices.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/shop" size="lg" className="bg-white text-brand-700 hover:bg-white/90">
                Shop all products
              </ButtonLink>
              <ButtonLink
                href="/category/microcontroller"
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:border-white hover:text-white"
              >
                Explore microcontrollers
              </ButtonLink>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-6 text-sm">
              <div>
                <dt className="text-white/60">Products</dt>
                <dd className="text-2xl font-bold">66+</dd>
              </div>
              <div>
                <dt className="text-white/60">Categories</dt>
                <dd className="text-2xl font-bold">{categories.length}</dd>
              </div>
              <div>
                <dt className="text-white/60">Dispatch</dt>
                <dd className="text-2xl font-bold">24h</dd>
              </div>
            </dl>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Microcontrollers", slug: "microcontroller" },
              { label: "Sensors", slug: "sensors" },
              { label: "Power", slug: "power" },
              { label: "Display Modules", slug: "display-modules" },
            ].map((tile) => (
              <Link
                key={tile.slug}
                href={`/category/${tile.slug}`}
                className="group rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur transition-all hover:border-white/40 hover:bg-white/20"
              >
                <p className="text-sm font-semibold uppercase tracking-wider text-white/60">Browse</p>
                <p className="mt-2 text-lg font-bold">{tile.label}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-white/80 group-hover:text-white">
                  View products
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-14">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Shop by category</h2>
            <p className="mt-1 text-sm text-slate-500">Find exactly the part you need.</p>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            View all
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-sm font-bold text-brand-700">
                {category.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="text-xs font-semibold leading-tight text-slate-700">{category.name}</span>
              <span className="text-[11px] text-slate-400">{category.count} items</span>
            </Link>
          ))}
        </div>
      </Container>

      <Container className="pb-14">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Deals &amp; popular picks</h2>
            <p className="mt-1 text-sm text-slate-500">Save on selected components.</p>
          </div>
          <Link href="/shop?onSale=1" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            All deals
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>

      <Container className="pb-14">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">New arrivals</h2>
            <p className="mt-1 text-sm text-slate-500">Fresh stock added to the catalogue.</p>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            Shop all
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {latest.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>

      <Container className="pb-16">
        <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-8 sm:grid-cols-3">
          <div>
            <h3 className="font-bold text-slate-900">Genuine components</h3>
            <p className="mt-1 text-sm text-slate-500">Sourced from trusted suppliers and tested before dispatch.</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Free shipping over Rs {settings.freeShippingMin}</h3>
            <p className="mt-1 text-sm text-slate-500">Flat Rs {settings.flatRate} shipping on smaller orders across India.</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900">GST invoices</h3>
            <p className="mt-1 text-sm text-slate-500">Compliant {settings.taxLabel} invoices for every order.</p>
          </div>
        </div>
      </Container>
    </>
  );
}
