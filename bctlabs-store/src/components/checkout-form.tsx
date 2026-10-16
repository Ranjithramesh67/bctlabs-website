"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui";
import type { Customer } from "@/lib/customers";
import { formatPrice } from "@/lib/format";
import type { CartItem, CartTotals } from "@/lib/pricing";

type AddressFields = {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
};

type BillingFields = AddressFields & { email: string; phone: string };

type PaymentMethod = "cod" | "phonepe";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const COUNTRIES = [
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "SG", label: "Singapore" },
  { value: "AU", label: "Australia" },
  { value: "CA", label: "Canada" },
];

const PAYMENT_OPTIONS: { value: PaymentMethod; title: string; description: string }[] = [
  { value: "cod", title: "Cash on delivery", description: "Pay in cash when your order is delivered." },
  { value: "phonepe", title: "PhonePe", description: "Pay online securely with PhonePe." },
];

const FIELD_LABELS: Record<string, string> = {
  firstName: "First name",
  lastName: "Last name",
  company: "Company name (optional)",
  address1: "Address",
  address2: "Apartment, suite, etc. (optional)",
  city: "City",
  state: "State",
  postcode: "Postcode",
  country: "Country",
  email: "Email address",
  phone: "Phone",
};

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  placeholder,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20" : undefined}
      />
      {error ? <p className="mt-1 text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}

function AddressGrid({
  prefix,
  values,
  onChange,
  errors,
  withContact,
}: {
  prefix: "billing" | "shipping";
  values: BillingFields;
  onChange: (key: string, value: string) => void;
  errors: Record<string, string>;
  withContact: boolean;
}) {
  const field = (key: keyof BillingFields) => ({
    id: `${prefix}.${key}`,
    label: FIELD_LABELS[key] ?? key,
    value: values[key],
    error: errors[`${prefix}.${key}`],
    onChange: (value: string) => onChange(key, value),
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field {...field("firstName")} autoComplete={`${prefix} given-name`} />
      <Field {...field("lastName")} autoComplete={`${prefix} family-name`} />
      <Field {...field("company")} autoComplete="organization" className="sm:col-span-2" />
      <Field {...field("address1")} autoComplete={`${prefix} address-line1`} placeholder="House number and street name" className="sm:col-span-2" />
      <Field {...field("address2")} autoComplete={`${prefix} address-line2`} placeholder="Apartment, suite, unit (optional)" className="sm:col-span-2" />
      <Field {...field("city")} autoComplete={`${prefix} address-level2`} />
      <Field {...field("state")} autoComplete={`${prefix} address-level1`} />
      <Field {...field("postcode")} autoComplete={`${prefix} postal-code`} />
      <div>
        <Label htmlFor={`${prefix}.country`}>Country</Label>
        <Select
          id={`${prefix}.country`}
          name={`${prefix}.country`}
          value={values.country}
          onChange={(event) => onChange("country", event.target.value)}
        >
          {COUNTRIES.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </Select>
      </div>
      {withContact ? (
        <>
          <Field {...field("email")} type="email" autoComplete={`${prefix} email`} />
          <Field {...field("phone")} type="tel" autoComplete={`${prefix} tel`} />
        </>
      ) : null}
    </div>
  );
}

export function CheckoutForm({
  items,
  totals,
  customer,
}: {
  items: CartItem[];
  totals: CartTotals;
  customer: Customer | null;
}) {
  const router = useRouter();

  const [billing, setBilling] = useState<BillingFields>({
    firstName: customer?.firstName ?? "",
    lastName: customer?.lastName ?? "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postcode: "",
    country: "IN",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
  });

  const [shipping, setShipping] = useState<BillingFields>({
    firstName: "",
    lastName: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postcode: "",
    country: "IN",
    email: "",
    phone: "",
  });

  const [shipToDifferent, setShipToDifferent] = useState(false);
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function clearError(key: string) {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function updateBilling(key: keyof BillingFields, value: string) {
    setBilling((prev) => ({ ...prev, [key]: value }));
    clearError(`billing.${key}`);
  }

  function updateShipping(key: keyof BillingFields, value: string) {
    setShipping((prev) => ({ ...prev, [key]: value }));
    clearError(`shipping.${key}`);
  }

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    const requiredBilling: (keyof BillingFields)[] = [
      "firstName",
      "lastName",
      "address1",
      "city",
      "state",
      "postcode",
      "country",
      "email",
      "phone",
    ];
    for (const key of requiredBilling) {
      if (!billing[key].trim()) {
        next[`billing.${key}`] = `${FIELD_LABELS[key] ?? "This field"} is required`;
      }
    }
    if (billing.email.trim() && !EMAIL_RE.test(billing.email.trim())) {
      next["billing.email"] = "Enter a valid email address";
    }
    if (shipToDifferent) {
      const requiredShipping: (keyof BillingFields)[] = [
        "firstName",
        "lastName",
        "address1",
        "city",
        "state",
        "postcode",
        "country",
      ];
      for (const key of requiredShipping) {
        if (!shipping[key].trim()) {
          next[`shipping.${key}`] = `${FIELD_LABELS[key] ?? "This field"} is required`;
        }
      }
    }
    return next;
  }

  function trimmed(fields: BillingFields) {
    return {
      firstName: fields.firstName.trim(),
      lastName: fields.lastName.trim(),
      company: fields.company.trim(),
      address1: fields.address1.trim(),
      address2: fields.address2.trim(),
      city: fields.city.trim(),
      state: fields.state.trim(),
      postcode: fields.postcode.trim(),
      country: fields.country.trim(),
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing: {
            ...trimmed(billing),
            email: billing.email.trim(),
            phone: billing.phone.trim(),
          },
          shipping: shipToDifferent ? trimmed(shipping) : undefined,
          paymentMethod: payment,
          customerNote: note.trim(),
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { id?: number; key?: string; error?: string; fields?: Record<string, string> }
        | null;

      if (!response.ok) {
        if (data?.fields) setErrors(data.fields);
        setFormError(data?.error ?? "We could not place your order. Please try again.");
        return;
      }
      if (!data?.id || !data?.key) {
        setFormError("We could not place your order. Please try again.");
        return;
      }

      router.push(`/checkout/success?order=${data.id}&key=${encodeURIComponent(data.key)}`);
      router.refresh();
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        {formError ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          >
            {formError}
          </div>
        ) : null}

        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900">Billing details</h2>
          <p className="mt-1 text-sm text-slate-500">We use these details for your invoice and delivery.</p>
          <div className="mt-5">
            <AddressGrid
              prefix="billing"
              values={billing}
              onChange={(key, value) => updateBilling(key as keyof BillingFields, value)}
              errors={errors}
              withContact
            />
          </div>
        </Card>

        <Card className="p-6">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              checked={shipToDifferent}
              onChange={(event) => setShipToDifferent(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-slate-700">Ship to a different address?</span>
          </label>

          {shipToDifferent ? (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-800">Shipping address</h3>
              <div className="mt-4">
                <AddressGrid
                  prefix="shipping"
                  values={shipping}
                  onChange={(key, value) => updateShipping(key as keyof BillingFields, value)}
                  errors={errors}
                  withContact={false}
                />
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900">Order notes</h2>
          <p className="mt-1 text-sm text-slate-500">Optional delivery instructions or a note for our team.</p>
          <div className="mt-4">
            <Label htmlFor="customerNote">Notes (optional)</Label>
            <Textarea
              id="customerNote"
              name="customerNote"
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. Please call before delivery."
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900">Payment method</h2>
          <div className="mt-4 space-y-3">
            {PAYMENT_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={clsx(
                  "flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition-colors",
                  payment === option.value
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-200 bg-white hover:border-slate-300",
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.value}
                  checked={payment === option.value}
                  onChange={() => setPayment(option.value)}
                  className="mt-0.5 h-4 w-4 text-brand-600 focus:ring-brand-500"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{option.title}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{option.description}</span>
                </span>
              </label>
            ))}
          </div>
        </Card>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900">Your order</h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3 py-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image ?? "/media/woocommerce-placeholder.webp"}
                    alt={item.name}
                    className="h-full w-full object-contain p-1"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium text-slate-800">{item.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.quantity} &times; {formatPrice(item.price)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Subtotal</dt>
              <dd className="font-medium text-slate-900">{formatPrice(totals.subtotal)}</dd>
            </div>
            {totals.discount > 0 ? (
              <div className="flex justify-between">
                <dt className="text-slate-500">Discount</dt>
                <dd className="font-medium text-emerald-600">-{formatPrice(totals.discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-slate-500">Tax</dt>
              <dd className="font-medium text-slate-900">{formatPrice(totals.tax)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Shipping</dt>
              <dd className="font-medium text-slate-900">
                {totals.shipping > 0 ? formatPrice(totals.shipping) : "Free"}
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-3 text-base">
              <dt className="font-bold text-slate-900">Total</dt>
              <dd className="font-bold text-slate-900">{formatPrice(totals.total)}</dd>
            </div>
          </dl>

          <Button type="submit" size="lg" disabled={pending} className="mt-5 w-full">
            {pending ? "Placing order..." : "Place order"}
          </Button>
          <p className="mt-3 text-center text-xs text-slate-400">
            By placing your order you agree to our terms. All prices in INR.
          </p>
        </Card>
      </aside>
    </form>
  );
}
