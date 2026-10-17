import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createCashfreeOrder, verifyWebhookSignature } from "@/lib/cashfree";

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Cashfree Payment Gateway client", () => {
  beforeEach(() => {
    process.env.CASHFREE_APP_ID = "114235187fa745d9da5853e29011532411";
    process.env.CASHFREE_SECRET_KEY = "cfsk_ma_prod_test_secret";
    process.env.CASHFREE_ENV = "production";
    delete process.env.CASHFREE_BASE_URL;
  });

  afterEach(() => {
    delete process.env.CASHFREE_APP_ID;
    delete process.env.CASHFREE_SECRET_KEY;
    delete process.env.CASHFREE_ENV;
    vi.unstubAllGlobals();
  });

  it("posts the order payload to the production host with gateway headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      json({
        cf_order_id: 123456,
        order_id: "bct-4391",
        order_status: "ACTIVE",
        payment_session_id: "session_abc",
        order_amount: 1499,
        order_currency: "INR",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const order = await createCashfreeOrder({
      orderId: "bct-4391",
      amount: 1499,
      customerId: "cust-31",
      customerEmail: "asha@example.com",
      customerPhone: "9876543210",
      returnUrl: "https://bctlabs.com/checkout/cashfree/return?order=4391",
      notifyUrl: "https://bctlabs.com/api/webhooks/cashfree",
    });

    expect(order.payment_session_id).toBe("session_abc");

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.cashfree.com/pg/orders");
    expect(init.headers).toMatchObject({
      "x-client-id": "114235187fa745d9da5853e29011532411",
      "x-client-secret": "cfsk_ma_prod_test_secret",
      "x-api-version": "2023-08-01",
    });
    expect(JSON.parse(String(init.body))).toMatchObject({
      order_id: "bct-4391",
      order_amount: 1499,
      order_currency: "INR",
      order_meta: {
        return_url: "https://bctlabs.com/checkout/cashfree/return?order=4391",
        notify_url: "https://bctlabs.com/api/webhooks/cashfree",
      },
    });
  });

  it("throws the gateway message when credentials are rejected", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(json({ message: "authentication Failed", code: "request_failed" }, 401)),
    );

    await expect(
      createCashfreeOrder({
        orderId: "bct-4391",
        amount: 10,
        customerId: "cust-31",
        customerEmail: "asha@example.com",
        customerPhone: "9876543210",
        returnUrl: "https://bctlabs.com/return",
      }),
    ).rejects.toThrow("authentication Failed");
  });

  it("rejects non-HTTPS return URLs in production before calling Cashfree", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createCashfreeOrder({
        orderId: "bct-4401",
        amount: 499,
        customerId: "guest-asha@example.com",
        customerEmail: "asha@example.com",
        customerPhone: "9876543210",
        returnUrl: "http://localhost:4000/checkout/cashfree/return?order=4401",
        notifyUrl: "http://localhost:4000/api/webhooks/cashfree",
      }),
    ).rejects.toThrow(/must use https/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("allows http URLs against the sandbox host", async () => {
    process.env.CASHFREE_ENV = "sandbox";
    const fetchMock = vi.fn().mockResolvedValue(
      json({
        cf_order_id: 123456,
        order_id: "bct-4402",
        order_status: "ACTIVE",
        payment_session_id: "session_sandbox",
        order_amount: 499,
        order_currency: "INR",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const order = await createCashfreeOrder({
      orderId: "bct-4402",
      amount: 499,
      customerId: "guest-asha@example.com",
      customerEmail: "asha@example.com",
      customerPhone: "9876543210",
      returnUrl: "http://localhost:4000/checkout/cashfree/return?order=4402",
    });

    expect(order.payment_session_id).toBe("session_sandbox");
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://sandbox.cashfree.com/pg/orders");
  });

  it("verifies the production webhook HMAC over timestamp + raw body", () => {
    const rawBody = JSON.stringify({ type: "PAYMENT_SUCCESS_WEBHOOK" });
    const timestamp = "1730000000";
    const signature = createHmac("sha256", "cfsk_ma_prod_test_secret")
      .update(`${timestamp}${rawBody}`)
      .digest("base64");

    expect(verifyWebhookSignature(rawBody, timestamp, signature)).toBe(true);
    expect(verifyWebhookSignature(rawBody, timestamp, "bm90LWEtc2lnbmF0dXJl")).toBe(false);
    expect(verifyWebhookSignature(rawBody, "", signature)).toBe(false);
  });
});
