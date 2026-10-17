"use client";

import { useState } from "react";

import { COUNTRIES } from "@/lib/countries";
import { Badge, Button, Card, Input, Label, Select } from "@/components/ui";
import type { SavedAddress } from "@/lib/address-fields";

type AddressForm = {
  label: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  isDefault: boolean;
};

const EMPTY_FORM: AddressForm = {
  label: "Home",
  firstName: "",
  lastName: "",
  company: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postcode: "",
  country: "IN",
  phone: "",
  isDefault: false,
};

function toForm(address: SavedAddress): AddressForm {
  return {
    label: address.label,
    firstName: address.firstName,
    lastName: address.lastName,
    company: address.company,
    address1: address.address1,
    address2: address.address2,
    city: address.city,
    state: address.state,
    postcode: address.postcode,
    country: address.country,
    phone: address.phone,
    isDefault: address.isDefault,
  };
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <p className="mt-1 text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}

export function AddressBook({ initialAddresses }: { initialAddresses: SavedAddress[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(initialAddresses.length === 0);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update(key: keyof AddressForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFields((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function startCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, isDefault: addresses.length === 0 });
    setFields({});
    setError(null);
    setFormOpen(true);
  }

  function startEdit(address: SavedAddress) {
    setEditingId(address.id);
    setForm(toForm(address));
    setFields({});
    setError(null);
    setFormOpen(true);
  }

  async function reload() {
    const response = await fetch("/api/account/addresses", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json().catch(() => null)) as { addresses?: SavedAddress[] } | null;
      if (data?.addresses) setAddresses(data.addresses);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFields({});
    setError(null);
    try {
      const response = await fetch(
        editingId ? `/api/account/addresses/${editingId}` : "/api/account/addresses",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = (await response.json().catch(() => null)) as
        | { error?: string; fields?: Record<string, string> }
        | null;
      if (!response.ok) {
        if (data?.fields) setFields(data.fields);
        setError(data?.error ?? "Could not save this address. Please try again.");
        return;
      }
      await reload();
      setFormOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  async function setDefault(address: SavedAddress) {
    setError(null);
    const response = await fetch(`/api/account/addresses/${address.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Could not update the default address.");
      return;
    }
    await reload();
  }

  async function remove(address: SavedAddress) {
    if (!window.confirm(`Remove the "${address.label}" address?`)) return;
    setError(null);
    const response = await fetch(`/api/account/addresses/${address.id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Could not remove this address.");
      return;
    }
    await reload();
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Saved addresses</h2>
          <p className="mt-1 text-sm text-slate-500">
            Reuse an address at checkout instead of typing it again.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={startCreate}>
          Add address
        </Button>
      </div>

      {error ? (
        <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {addresses.length ? (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <li key={address.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900">{address.label}</span>
                {address.isDefault ? <Badge tone="green">Default</Badge> : null}
              </div>
              <p className="mt-2 text-sm text-slate-700">
                {address.firstName} {address.lastName}
              </p>
              <p className="text-sm text-slate-500">
                {address.address1}
                {address.address2 ? `, ${address.address2}` : ""}
                <br />
                {address.city}, {address.state} {address.postcode}
              </p>
              <p className="mt-1 text-sm text-slate-500">{address.phone}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(address)}>
                  Edit
                </Button>
                {!address.isDefault ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setDefault(address)}>
                    Set default
                  </Button>
                ) : null}
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(address)}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
          No saved addresses yet. Add one to speed up your next order.
        </p>
      )}

      {formOpen ? (
        <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-slate-200 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-800">
            {editingId ? "Edit address" : "New address"}
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              id="address.label"
              label="Label"
              value={form.label}
              onChange={(value) => update("label", value)}
              error={fields.label}
              className="sm:col-span-2"
            />
            <Field
              id="address.firstName"
              label="First name"
              value={form.firstName}
              onChange={(value) => update("firstName", value)}
              error={fields.firstName}
              autoComplete="given-name"
            />
            <Field
              id="address.lastName"
              label="Last name"
              value={form.lastName}
              onChange={(value) => update("lastName", value)}
              error={fields.lastName}
              autoComplete="family-name"
            />
            <Field
              id="address.company"
              label="Company name (optional)"
              value={form.company}
              onChange={(value) => update("company", value)}
              error={fields.company}
              className="sm:col-span-2"
            />
            <Field
              id="address.address1"
              label="Address"
              value={form.address1}
              onChange={(value) => update("address1", value)}
              error={fields.address1}
              autoComplete="address-line1"
              className="sm:col-span-2"
            />
            <Field
              id="address.address2"
              label="Apartment, suite, etc. (optional)"
              value={form.address2}
              onChange={(value) => update("address2", value)}
              error={fields.address2}
              autoComplete="address-line2"
              className="sm:col-span-2"
            />
            <Field
              id="address.city"
              label="City"
              value={form.city}
              onChange={(value) => update("city", value)}
              error={fields.city}
              autoComplete="address-level2"
            />
            <Field
              id="address.state"
              label="State"
              value={form.state}
              onChange={(value) => update("state", value)}
              error={fields.state}
              autoComplete="address-level1"
            />
            <Field
              id="address.postcode"
              label="Postcode"
              value={form.postcode}
              onChange={(value) => update("postcode", value)}
              error={fields.postcode}
              autoComplete="postal-code"
            />
            <div>
              <Label htmlFor="address.country">Country</Label>
              <Select
                id="address.country"
                value={form.country}
                onChange={(event) => update("country", event.target.value)}
              >
                {COUNTRIES.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </Select>
              {fields.country ? (
                <p className="mt-1 text-xs font-medium text-rose-600">{fields.country}</p>
              ) : null}
            </div>
            <Field
              id="address.phone"
              label="Phone"
              value={form.phone}
              onChange={(value) => update("phone", value)}
              error={fields.phone}
              type="tel"
              autoComplete="tel"
            />
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(event) => setForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Make this my default address
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Saving..." : editingId ? "Save changes" : "Save address"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setFormOpen(false);
                setEditingId(null);
                setFields({});
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </Card>
  );
}
