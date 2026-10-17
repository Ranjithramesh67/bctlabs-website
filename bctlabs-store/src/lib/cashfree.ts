import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

/**
 * Cashfree Payment Gateway client (API version 2023-08-01).
 *
 * Credentials are supplied by the operator through the project's own
 * environment variables - never hardcoded:
 *   CASHFREE_APP_ID       - Cashfree App ID (x-client-id)
 *   CASHFREE_SECRET_KEY   - Cashfree Secret Key (x-client-secret)
 *   CASHFREE_ENV          - "sandbox" (default) or "production"
 *   CASHFREE_SANDBOX_APP_ID / CASHFREE_SANDBOX_SECRET_KEY
 *                         - optional sandbox pair, used when
 *                           CASHFREE_ENV=sandbox so a live pair can stay
 *                           configured for production.
 *   CASHFREE_BASE_URL     - override the API base (default sandbox/production)
 *   CASHFREE_API_VERSION  - defaults to 2023-08-01
 *
 * See `.env.example`. Until both keys are set, `isCashfreeConfigured()`
 * returns false and the checkout hides the online-payment option.
 */

const DEFAULT_API_VERSION = "2023-08-01";

type CashfreeCredentials = { appId: string; secret: string };

function credentials(): CashfreeCredentials | null {
  if (isCashfreeProduction()) {
    const appId = process.env.CASHFREE_APP_ID;
    const secret = process.env.CASHFREE_SECRET_KEY;
    return appId && secret ? { appId, secret } : null;
  }
  // Sandbox: prefer a dedicated test pair, else fall back to the generic pair
  // (useful when only sandbox keys are configured at all).
  const appId = process.env.CASHFREE_SANDBOX_APP_ID || process.env.CASHFREE_APP_ID;
  const secret = process.env.CASHFREE_SANDBOX_SECRET_KEY || process.env.CASHFREE_SECRET_KEY;
  return appId && secret ? { appId, secret } : null;
}

export function isCashfreeConfigured(): boolean {
  return credentials() !== null;
}

/** Webhook signing only needs the secret, not a complete key pair. */
function webhookSecret(): string | undefined {
  if (isCashfreeProduction()) return process.env.CASHFREE_SECRET_KEY;
  return process.env.CASHFREE_SANDBOX_SECRET_KEY || process.env.CASHFREE_SECRET_KEY;
}

export function isCashfreeProduction(): boolean {
  return (process.env.CASHFREE_ENV ?? "sandbox").toLowerCase() === "production";
}

/**
 * Local/test only: lets the checkout exercise the full order -> payment ->
 * fulfilment flow without live gateway credentials. Never available in a
 * production build, even if the flag leaks into the environment.
 */
export function isCashfreeMockEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.CASHFREE_MOCK === "1";
}

export function isCashfreeAvailable(): boolean {
  return isCashfreeConfigured() || isCashfreeMockEnabled();
}

export function mockPaymentSession(orderId: number): string {
  return `mock_${orderId}_${Date.now().toString(36)}`;
}

function baseUrl(): string {
  if (process.env.CASHFREE_BASE_URL) return process.env.CASHFREE_BASE_URL.replace(/\/+$/, "");
  return isCashfreeProduction()
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

function headers(): Record<string, string> {
  const creds = credentials();
  if (!creds) throw new Error("Cashfree credentials are not configured");
  return {
    "Content-Type": "application/json",
    "x-client-id": creds.appId,
    "x-client-secret": creds.secret,
    "x-api-version": process.env.CASHFREE_API_VERSION || DEFAULT_API_VERSION,
  };
}

export type CashfreeOrder = {
  cf_order_id: number | string;
  order_id: string;
  order_status: string;
  payment_session_id: string;
  order_amount: number;
  order_currency: string;
};

export type CreateCashfreeOrderInput = {
  orderId: string;
  amount: number;
  currency?: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
  notifyUrl?: string;
  note?: string;
};

/** Create a Cashfree order and return its payment session. */
export async function createCashfreeOrder(input: CreateCashfreeOrderInput): Promise<CashfreeOrder> {
  // Production Cashfree rejects non-HTTPS return/notify URLs. Fail with an
  // actionable message instead of a generic gateway error.
  if (isCashfreeProduction()) {
    for (const [label, value] of [
      ["return_url", input.returnUrl],
      ["notify_url", input.notifyUrl],
    ] as const) {
      if (value && !value.startsWith("https://")) {
        throw new Error(`Cashfree ${label} must use https in production (received ${value})`);
      }
    }
  }

  const response = await fetch(`${baseUrl()}/orders`, {
    method: "POST",
    headers: headers(),
    cache: "no-store",
    body: JSON.stringify({
      order_id: input.orderId,
      order_amount: Number(input.amount.toFixed(2)),
      order_currency: input.currency ?? "INR",
      customer_details: {
        customer_id: input.customerId,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
      },
      order_meta: {
        return_url: input.returnUrl,
        ...(input.notifyUrl ? { notify_url: input.notifyUrl } : {}),
      },
      ...(input.note ? { order_note: input.note } : {}),
    }),
  });

  const data = (await response.json().catch(() => null)) as (CashfreeOrder & { message?: string }) | null;
  if (!response.ok || !data?.payment_session_id) {
    const detail = data?.message ?? `Cashfree order creation failed (${response.status})`;
    throw new Error(detail);
  }
  return data;
}

/** Fetch a Cashfree order to confirm its current status. */
export async function getCashfreeOrder(cashfreeOrderId: string): Promise<CashfreeOrder | null> {
  const response = await fetch(`${baseUrl()}/orders/${encodeURIComponent(cashfreeOrderId)}`, {
    method: "GET",
    headers: headers(),
    cache: "no-store",
  });
  if (!response.ok) return null;
  return (await response.json().catch(() => null)) as CashfreeOrder | null;
}

/**
 * Verify the `x-webhook-signature` header sent by Cashfree.
 * The signature is HMAC-SHA256 of `timestamp + rawBody`, keyed with the secret.
 */
export function verifyWebhookSignature(rawBody: string, timestamp: string, signature: string): boolean {
  const secret = webhookSecret();
  if (!secret || !timestamp || !signature) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}${rawBody}`).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isPaidStatus(status: string | null | undefined): boolean {
  return status === "PAID";
}

export type CashfreePayment = {
  cf_payment_id: number | string;
  payment_status: string;
  payment_amount: number;
  payment_method?: string;
  payment_time?: string;
};

/** List the payment attempts recorded against a Cashfree order. */
export async function getCashfreePayments(cashfreeOrderId: string): Promise<CashfreePayment[]> {
  const response = await fetch(`${baseUrl()}/orders/${encodeURIComponent(cashfreeOrderId)}/payments`, {
    method: "GET",
    headers: headers(),
    cache: "no-store",
  });
  if (!response.ok) return [];
  const data = (await response.json().catch(() => null)) as CashfreePayment[] | null;
  return Array.isArray(data) ? data : [];
}

export function findSuccessfulPayment(payments: CashfreePayment[]): CashfreePayment | null {
  return payments.find((payment) => payment.payment_status === "SUCCESS") ?? null;
}
