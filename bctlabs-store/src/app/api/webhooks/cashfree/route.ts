import { handleCashfreeWebhook } from "@/lib/cashfree-webhook";

/**
 * Cashfree webhook receiver.
 *
 * Next.js route handlers expose the raw body via `request.text()`, which is the
 * equivalent of mounting `express.raw()` before `express.json()`: the HMAC is
 * always computed over the exact bytes Cashfree signed.
 */
export async function POST(request: Request) {
  return handleCashfreeWebhook(request);
}
