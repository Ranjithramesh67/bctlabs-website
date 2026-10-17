import { handleCashfreeWebhook } from "@/lib/cashfree-webhook";

/**
 * Cashfree webhook receiver.
 *
 * Configure the URL (e.g. `https://bctlabs.com/api/payments/cashfree/webhook`)
 * in the Cashfree dashboard so payments are confirmed even if the customer
 * closes the browser before returning to the store.
 */
export async function POST(request: Request) {
  return handleCashfreeWebhook(request);
}
