import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { ButtonLink, Container, SectionHeading, Stars } from "@/components/ui";
import { BRAND, CATEGORY_HIGHLIGHTS, TESTIMONIALS, WHY_US } from "@/lib/site-content";
import { formatPrice, formatProductPrice } from "@/lib/format";
import {
  getCategoryShowcase,
  getFeaturedProducts,
  getProducts,
  getStorefrontCategories,
} from "@/lib/store";
import { getStoreSettings } from "@/lib/settings";
import { FeatureIcon, IconArrowRight, IconCheck, IconPhone } from "@/components/icons";

export default async function HomePage() {
  const [showcase, featured, latest, bestsellers, settings, allCategories] = await Promise.all([
    getCategoryShowcase(8),
    getFeaturedProducts(8),
    getProducts({ sort: "newest", perPage: 8 }),
    getProducts({ sort: "popular", perPage: 4 }),
    getStoreSettings(),
    getStorefrontCategories(),
  ]);

  const heroProducts = featured.filter((product) => product.image).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="brand-mesh relative overflow-hidden text-white">
        <div className="brand-dots absolute inset-0 opacity-60" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent-500/25 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-gold-500/20 blur-3xl" />

        <Container className="relative grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Trusted by makers since {BRAND.founded}
            </span>
            <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Components that bring
              <span className="bg-gradient-to-r from-gold-400 via-accent-400 to-brand-300 bg-clip-text text-transparent">
                {" "}
                your ideas to life
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
              Microcontrollers, sensors, drivers, displays and power modules - hand-checked,
              fairly priced and dispatched from our warehouse the same day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink
                href="/shop"
                size="lg"
                variant="inverse"
              >
                Shop all products
                <IconArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink
                href="/shop?onSale=1"
                size="lg"
                variant="onDark"
              >
                View today&apos;s deals
              </ButtonLink>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {[
                { label: "Products in stock", value: `${latest.total}+` },
                { label: "Categories", value: `${allCategories.length}` },
                { label: "Years of service", value: `${new Date().getFullYear() - BRAND.founded}+` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <dt className="text-xs text-white/70">{stat.label}</dt>
                  <dd className="mt-1 text-2xl font-extrabold">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {heroProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className={`group rounded-2xl border border-white/15 bg-white/95 p-3 shadow-xl transition-transform hover:-translate-y-1 ${
                    index % 2 === 1 ? "mt-8" : ""
                  }`}
                >
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                    className="h-32 w-full rounded-xl bg-white"
                  />
                  <p className="mt-3 line-clamp-2 text-sm font-semibold text-ink-900">{product.name}</p>
                  <p className="mt-1 text-sm font-bold text-brand-700">{formatProductPrice(product.price)}</p>
                </Link>
              ))}
            </div>
            <div className="mx-auto mt-8 flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-ink-900">
                Free shipping over {formatPrice(settings.freeShippingMin)}
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* Why us */}
      <section className="border-b border-slate-200 bg-white">
        <Container className="grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_US.map((feature) => (
            <div key={feature.title} className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <FeatureIcon name={feature.icon} className="h-5.5 w-5.5" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink-900">{feature.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* Categories */}
      <Container className="py-16">
        <SectionHeading
          eyebrow="Browse the catalogue"
          title="Shop by category"
          description="From beginner-friendly starter parts to industrial-grade modules."
          action={
            <ButtonLink href="/shop" variant="outline" size="sm">
              All products
              <IconArrowRight className="h-4 w-4" />
            </ButtonLink>
          }
        />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {showcase.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl"
            >
              <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-white p-3">
                <ProductImage
                  src={category.image}
                  alt={category.name}
                  className="h-24 w-full transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 text-sm font-bold text-ink-900">{category.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">{category.count} products</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                Shop now
                <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Container>

      {/* Deals */}
      <section className="border-y border-slate-200 bg-white">
        <Container className="py-16">
          <SectionHeading
            eyebrow="Limited-time pricing"
            title="Deals and popular picks"
            description="Genuine parts at reduced prices while stock lasts."
            action={
              <ButtonLink href="/shop?onSale=1" variant="outline" size="sm">
                All deals
                <IconArrowRight className="h-4 w-4" />
              </ButtonLink>
            }
          />
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      {/* New arrivals + bestsellers */}
      <Container className="py-16">
        <SectionHeading
          eyebrow="Fresh stock"
          title="New arrivals"
          description="The latest components added to the BCTLABS catalogue."
          action={
            <ButtonLink href="/shop?sort=newest" variant="outline" size="sm">
              See what&apos;s new
              <IconArrowRight className="h-4 w-4" />
            </ButtonLink>
          }
        />
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {latest.items.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>

      {/* Bestsellers banner */}
      {bestsellers.items.length ? (
        <section className="bg-brand-900 text-white">
          <Container className="grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-200">
                Loved by our customers
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Bestselling modules
              </h2>
              <p className="mt-4 max-w-md text-white/75">
                These are the parts our makers, schools and workshops reorder again and again.
                Proven, reliable and always in stock.
              </p>
              <ButtonLink
                href="/shop?sort=popular"
                size="lg"
                variant="inverse"
                className="mt-7"
              >
                Browse bestsellers
                <IconArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {bestsellers.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* Category highlights strip */}
      <Container className="py-16">
        <SectionHeading
          eyebrow="Quick links"
          title="Jump straight to what you need"
          align="center"
        />
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          {CATEGORY_HIGHLIGHTS.map((tile) => (
            <Link
              key={tile.slug}
              href={`/category/${tile.slug}`}
              className="group rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all hover:border-brand-400 hover:bg-brand-50"
            >
              <span className="font-semibold text-ink-900 group-hover:text-brand-700">{tile.name}</span>
              <span className="ml-2 text-xs text-slate-400">{tile.blurb}</span>
            </Link>
          ))}
        </div>
      </Container>

      {/* Testimonials */}
      <section className="border-y border-slate-200 bg-white">
        <Container className="py-16">
          <SectionHeading
            eyebrow="Happy customers"
            title="What our customers say"
            align="center"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <figure
                key={testimonial.name}
                className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-brand-50/40 p-6 shadow-sm"
              >
                <Stars rating={5} />
                <blockquote className="mt-4 text-sm leading-relaxed text-slate-600">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {testimonial.name
                      .split(" ")
                      .filter((part) => /[A-Za-z]/.test(part[0] ?? ""))
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink-900">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">{testimonial.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* Assurance + contact CTA */}
      <Container className="py-16">
        <div className="grid gap-8 overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 lg:grid-cols-[1.3fr_1fr] lg:p-10">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
              Why makers across India choose BCTLABS
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500">
              We have been supplying electronics to students, hobbyists, schools and businesses
              since {BRAND.founded}. Every order ships with a GST invoice and is backed by real
              technical support.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Same-day dispatch before 3 PM",
                "GST invoice on every order",
                `Free shipping over ${formatPrice(settings.freeShippingMin)}`,
                "7-day easy returns",
              ].map((point) => (
                <li key={point} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <IconCheck className="h-3.5 w-3.5" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-200">
              Bulk or lab order?
            </p>
            <h3 className="mt-2 text-xl font-bold">Talk to our team</h3>
            <p className="mt-2 text-sm text-white/75">
              Schools, colleges and businesses get custom quotes, project kits and priority
              dispatch. We are happy to help you plan your order.
            </p>
            <a
              href={BRAND.phoneHref}
              className="mt-5 flex items-center gap-2.5 rounded-xl bg-white/10 px-4 py-3 font-semibold text-white transition-colors hover:bg-white/20"
            >
              <IconPhone className="h-5 w-5" />
              {BRAND.phone}
            </a>
            <ButtonLink
              href="/contact-us"
              size="sm"
              variant="inverse"
              className="mt-3 w-full"
            >
              Send an enquiry
            </ButtonLink>
          </div>
        </div>
      </Container>

      {/* Newsletter */}
      <section className="brand-mesh relative overflow-hidden text-white">
        <div className="brand-dots absolute inset-0 opacity-50" />
        <Container className="relative grid gap-6 py-14 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Get new arrivals and deals first
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/75">
              Join our list for restock alerts, project ideas and subscriber-only discounts. No
              spam, just useful updates.
            </p>
          </div>
          <NewsletterForm />
        </Container>
      </section>
    </>
  );
}
