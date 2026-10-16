import Link from "next/link";
import type { Metadata } from "next";

import { ButtonLink, Card, Container } from "@/components/ui";
import { cleanContent, formatDate } from "@/lib/format";
import { getCustomerCount } from "@/lib/customers";
import { getStoreSettings } from "@/lib/settings";
import { getCategories, getPageBySlug, getProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Tailwind typography utilities applied to raw WordPress HTML. */
const CONTENT_CLASS =
  "text-[15px] leading-relaxed text-slate-600 [&_p]:mb-4 [&_p]:leading-relaxed [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h4]:mt-5 [&_h4]:mb-2 [&_h4]:font-semibold [&_h4]:text-slate-900 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_a]:font-medium [&_a]:text-brand-600 [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-brand-300 hover:[&_a]:text-brand-700 [&_img]:my-5 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-500 [&_table]:my-4 [&_table]:w-full [&_td]:border-b [&_td]:border-slate-100 [&_td]:py-2 [&_th]:border-b [&_th]:border-slate-200 [&_th]:py-2 [&_th]:text-left [&_strong]:font-semibold [&_strong]:text-slate-800";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  return {
    title: "About us",
    description:
      settings.description ||
      `Learn more about ${settings.name} - electronic components, development boards and STEM kits.`,
  };
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center shadow-sm">
      <p className="text-3xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

export default async function AboutPage() {
  const [settings, products, categories, customers, aboutUs, about] = await Promise.all([
    getStoreSettings(),
    getProducts({ perPage: 1 }),
    getCategories(),
    getCustomerCount(),
    getPageBySlug("about-us"),
    getPageBySlug("about"),
  ]);

  const page = aboutUs ?? about;
  const body = page ? cleanContent(page.content) : "";
  const updated = page ? formatDate(page.updated) : "";

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-br from-brand-50 via-white to-white">
        <Container className="py-14 sm:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
              About us
            </span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              {settings.name}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">{settings.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/shop">Browse the shop</ButtonLink>
              <ButtonLink href="/contact-us" variant="outline">
                Contact us
              </ButtonLink>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat value={`${products.total}`} label="Products in catalogue" />
            <Stat value={`${categories.length}`} label="Product categories" />
            <Stat value={`${customers}`} label="Happy customers" />
          </div>
        </Container>
      </section>

      <Container className="py-12">
        {page ? (
          <article className="mx-auto max-w-3xl">
            <header className="border-b border-slate-100 pb-5">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{page.title}</h2>
              {updated ? <p className="mt-2 text-sm text-slate-500">Last updated {updated}</p> : null}
            </header>
            {body ? (
              <div className={`mt-6 ${CONTENT_CLASS}`} dangerouslySetInnerHTML={{ __html: body }} />
            ) : (
              <p className="mt-6 text-sm text-slate-500">This page has no content yet.</p>
            )}
          </article>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.6fr_1fr]">
            <div className={CONTENT_CLASS}>
              <h2>Engineering the tools of tomorrow</h2>
              <p>
                {settings.name} is an online store for makers, students, hobbyists and professional
                engineers across India. We stock a curated range of electronic components,
                development boards, sensors, modules and STEM kits - everything you need to move from
                a first breadboard sketch to a finished, production-ready prototype.
              </p>
              <p>
                Every product is sourced from trusted manufacturers and verified before it ships. Our
                catalogue spans microcontrollers and single-board computers, passive and active
                components, power supplies, robotics parts, test equipment and educational kits for
                classrooms and self-learners alike.
              </p>

              <h3>Why buy from us</h3>
              <ul>
                <li>Genuine, quality-checked parts with clear specifications.</li>
                <li>Fast dispatch and reliable pan-India shipping.</li>
                <li>Fair, transparent pricing with regular offers on popular items.</li>
                <li>Helpful support before and after your purchase.</li>
              </ul>

              <h3>Built for learning and building</h3>
              <p>
                Whether you are wiring your very first LED or documenting a complex multi-board
                project, we want the parts to be the easy part. Browse the shop, explore our guides
                and reach out whenever you need a hand - we are always happy to help you build
                something great.
              </p>
              <p>
                <Link href="/shop">Shop all products</Link>
              </p>
            </div>

            <aside className="space-y-6">
              <Card className="p-6">
                <h3 className="text-base font-semibold text-slate-900">Get in touch</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  {settings.address ? (
                    <div>
                      <dt className="font-medium text-slate-500">Address</dt>
                      <dd className="mt-0.5 text-slate-800">
                        {settings.address}
                        {settings.city ? `, ${settings.city}` : ""}
                      </dd>
                    </div>
                  ) : null}
                  {settings.phone ? (
                    <div>
                      <dt className="font-medium text-slate-500">Phone</dt>
                      <dd className="mt-0.5 text-slate-800">{settings.phone}</dd>
                    </div>
                  ) : null}
                  {settings.email ? (
                    <div>
                      <dt className="font-medium text-slate-500">Email</dt>
                      <dd className="mt-0.5">
                        <a
                          href={`mailto:${settings.email}`}
                          className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-2 hover:text-brand-700"
                        >
                          {settings.email}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>
                <div className="mt-5">
                  <ButtonLink href="/contact-us" variant="outline" size="sm">
                    Contact support
                  </ButtonLink>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-base font-semibold text-slate-900">By the numbers</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Products</dt>
                    <dd className="font-semibold text-slate-900">{products.total}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Categories</dt>
                    <dd className="font-semibold text-slate-900">{categories.length}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Customers</dt>
                    <dd className="font-semibold text-slate-900">{customers}</dd>
                  </div>
                </dl>
              </Card>
            </aside>
          </div>
        )}
      </Container>
    </>
  );
}
