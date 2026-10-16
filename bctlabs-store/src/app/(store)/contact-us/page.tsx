import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Card, Container } from "@/components/ui";
import { getStoreSettings } from "@/lib/settings";
import { BRAND } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Contact us" };
}

export default async function ContactUsPage() {
  const settings = await getStoreSettings();

  return (
    <Container className="py-10">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Contact us</h1>
        <p className="mt-3 text-base text-slate-600">
          Questions about a part, a bulk order or a project in progress? Send us a message and our team at{" "}
          {settings.name} will get back to you within one business day.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <Card className="p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">Send us a message</h2>
          <p className="mt-1 text-sm text-slate-500">
            Fields marked with an asterisk are required. We only use your details to reply to this enquiry.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">Store details</h2>
          <dl className="mt-6 space-y-5 text-sm">
            <div>
              <dt className="font-semibold text-slate-500">Store name</dt>
              <dd className="mt-1 text-slate-900">{settings.name}</dd>
            </div>

            <div>
              <dt className="font-semibold text-slate-500">Address</dt>
              <dd className="mt-1 text-slate-900">
                {settings.address ? <span>{settings.address}</span> : null}
                {settings.address && settings.city ? <br /> : null}
                {settings.city ? <span>{settings.city}</span> : null}
                {!settings.address && !settings.city ? (
                  <span className="text-slate-500">Available on request</span>
                ) : null}
              </dd>
            </div>

            <div>
              <dt className="font-semibold text-slate-500">Phone</dt>
              <dd className="mt-1">
                {settings.phone ? (
                  <a
                    href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                    className="font-semibold text-brand-600 hover:text-brand-700"
                  >
                    {settings.phone}
                  </a>
                ) : (
                  <span className="text-slate-500">Available on request</span>
                )}
              </dd>
            </div>

            <div>
              <dt className="font-semibold text-slate-500">Email</dt>
              <dd className="mt-1">
                <a href={`mailto:${settings.email}`} className="font-semibold text-brand-600 hover:text-brand-700">
                  {settings.email}
                </a>
              </dd>
            </div>

            <div>
              <dt className="font-semibold text-slate-500">Business hours</dt>
              <dd className="mt-1 text-slate-900">
                {BRAND.hours}
                <br />
                Sunday: Closed
              </dd>
            </div>
          </dl>

          <p className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            For order-specific help, keep your order number handy - you can also track an order from your account.
          </p>
        </Card>
      </div>
    </Container>
  );
}
