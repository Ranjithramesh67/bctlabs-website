"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { TrackedOrder } from "@/app/api/track-order/route";
import { Button, Card, Input, Label, StatusBadge } from "@/components/ui";
import { formatDate, formatPrice, shipmentStatusLabel } from "@/lib/format";

type FieldErrors = { orderId?: string; email?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function OrderTrackingForm({
  initialOrder = "",
  initialEmail = "",
}: {
  initialOrder?: string;
  initialEmail?: string;
}) {
  const [orderId, setOrderId] = useState(initialOrder);
  const [email, setEmail] = useState(initialEmail);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [pending, setPending] = useState(false);
  const autoLookedUp = useRef(false);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    const id = Number(orderId.trim());
    if (!orderId.trim()) next.orderId = "Order ID is required.";
    else if (!Number.isInteger(id) || id <= 0) next.orderId = "Enter a valid order number.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = "Enter a valid email address.";
    return next;
  }

  async function lookup(orderValue: string, emailValue: string) {
    setPending(true);
    setFormError("");
    setNotFound(false);
    setOrder(null);

    try {
      const response = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: Number(orderValue), email: emailValue.trim() }),
      });

      if (response.status === 404) {
        setNotFound(true);
        return;
      }

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setFormError(data?.error ?? "We could not look up your order. Please try again.");
        return;
      }

      setOrder((await response.json()) as TrackedOrder);
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  // Deep links (/order-tracking?order=123&email=...) run the lookup automatically.
  useEffect(() => {
    if (autoLookedUp.current) return;
    if (!initialOrder.trim() || !initialEmail.trim()) return;
    autoLookedUp.current = true;
    if (Number(initialOrder) > 0 && EMAIL_PATTERN.test(initialEmail.trim())) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot deep-link lookup
      void lookup(initialOrder, initialEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fieldErrors = validate();
    setErrors(fieldErrors);
    setFormError("");
    if (Object.keys(fieldErrors).length > 0) return;
    void lookup(orderId, email);
  }

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {formError ? (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
            >
              {formError}
            </p>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="track-order-id">Order ID</Label>
              <Input
                id="track-order-id"
                name="order"
                type="number"
                inputMode="numeric"
                min={1}
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                placeholder="e.g. 1042"
                aria-invalid={Boolean(errors.orderId)}
                className={
                  errors.orderId ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20" : undefined
                }
              />
              {errors.orderId ? (
                <p className="mt-1.5 text-xs text-rose-600">{errors.orderId}</p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="track-email">Billing email</Label>
              <Input
                id="track-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                aria-invalid={Boolean(errors.email)}
                className={
                  errors.email ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20" : undefined
                }
              />
              {errors.email ? <p className="mt-1.5 text-xs text-rose-600">{errors.email}</p> : null}
            </div>
          </div>

          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Looking up..." : "Track order"}
          </Button>
        </form>
      </Card>

      {notFound ? (
        <div
          role="alert"
          className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-800"
        >
          We could not find an order with those details. Please check your order number and the
          email address used at checkout.
        </div>
      ) : null}

      {order ? (
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Order number</p>
              <p className="text-lg font-bold text-slate-900">#{order.id}</p>
            </div>
            <div className="flex items-center gap-4">
              {order.dateCreated ? (
                <span className="text-sm text-slate-500">{formatDate(order.dateCreated)}</span>
              ) : null}
              <StatusBadge status={order.status} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Product</th>
                  <th className="px-6 py-3 text-right font-semibold">Price</th>
                  <th className="px-6 py-3 text-center font-semibold">Qty</th>
                  <th className="px-6 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      {formatPrice(item.price, order.currency)}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">{item.quantity}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      {formatPrice(item.total, order.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {order.shipment?.awbNumber ? (
            <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4">
              <h2 className="text-sm font-bold text-slate-900">Delivery</h2>
              <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Courier</dt>
                  <dd className="font-medium text-slate-800">{order.shipment.courierName || "NimbusPost"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">AWB number</dt>
                  <dd className="font-mono text-slate-800">{order.shipment.awbNumber}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Status</dt>
                  <dd className="font-medium text-slate-800">
                    {shipmentStatusLabel(order.shipment.status)}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          <div className="grid gap-6 border-t border-slate-100 px-6 py-6 sm:grid-cols-2">
            <div>
              {order.shippingAddress ? (
                <>
                  <h2 className="text-sm font-bold text-slate-900">Shipping address</h2>
                  <address className="mt-2 space-y-0.5 text-sm not-italic text-slate-600">
                    <p className="font-medium text-slate-800">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    {order.shippingAddress.company ? <p>{order.shippingAddress.company}</p> : null}
                    <p>{order.shippingAddress.address1}</p>
                    {order.shippingAddress.address2 ? <p>{order.shippingAddress.address2}</p> : null}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                      {order.shippingAddress.postcode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </address>
                </>
              ) : null}
            </div>

            <dl className="space-y-2 text-sm sm:col-start-2 sm:justify-self-end sm:text-right">
              <div className="flex justify-between gap-8">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="font-medium text-slate-900">
                  {formatPrice(order.subtotal, order.currency)}
                </dd>
              </div>
              {order.discount > 0 ? (
                <div className="flex justify-between gap-8">
                  <dt className="text-slate-500">Discount</dt>
                  <dd className="font-medium text-emerald-600">
                    -{formatPrice(order.discount, order.currency)}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-8">
                <dt className="text-slate-500">Tax</dt>
                <dd className="font-medium text-slate-900">
                  {formatPrice(order.tax, order.currency)}
                </dd>
              </div>
              <div className="flex justify-between gap-8">
                <dt className="text-slate-500">Shipping</dt>
                <dd className="font-medium text-slate-900">
                  {order.shipping > 0 ? formatPrice(order.shipping, order.currency) : "Free"}
                </dd>
              </div>
              <div className="flex justify-between gap-8 border-t border-slate-100 pt-3 text-base">
                <dt className="font-bold text-slate-900">Total</dt>
                <dd className="font-bold text-slate-900">
                  {formatPrice(order.total, order.currency)}
                </dd>
              </div>
            </dl>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
