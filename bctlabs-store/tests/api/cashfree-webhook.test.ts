import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getOrderById = vi.fn();
const confirmOrderPayment = vi.fn();
const recordPaymentEvent = vi.fn();

vi.mock("@/lib/orders", () => ({ getOrderById: (...args: unknown[]) => getOrderById(...args) }));
vi.mock("@/lib/payments", () => ({
  confirmOrderPayment: (...args: unknown[]) => confirmOrderPayment(...args),
  recordPaymentEvent: (...args: unknown[]) => recordPaymentEvent(...args),
}));

import { POST } from "@/app/api/webhooks/cashfree/route";

const SECRET = "cf_test_secret";
const TIMESTAMP = "1730000000";

function sign(body: string, timestamp = TIMESTAMP, secret = SECRET) {
  return createHmac("sha256", secret).update(`${timestamp}${body}`).digest("base64");
}

function webhookRequest(body: string, options: { signature?: string; timestamp?: string } = {}) {
  return new Request("http://localhost/api/webhooks/cashfree", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-timestamp": options.timestamp ?? TIMESTAMP,
      "x-webhook-signature": options.signature ?? sign(body),
    },
    body,
  });
}

const paidPayload = JSON.stringify({
  type: "PAYMENT_SUCCESS_WEBHOOK",
  data: {
    order: { order_id: "bct-4386-abc123", order_amount: 1499 },
    payment: {
      cf_payment_id: 987654321,
      payment_status: "SUCCESS",
      payment_amount: 1499,
      payment_method: { card: { card_network: "visa" } },
    },
  },
});

const order = {
  id: 4386,
  total: 1499,
  status: "pending",
  transactionId: null,
};

describe("POST /api/webhooks/cashfree", () => {
  beforeEach(() => {
    process.env.CASHFREE_SECRET_KEY = SECRET;
    getOrderById.mockResolvedValue(order);
    confirmOrderPayment.mockResolvedValue({ status: "paid", orderId: 4386 });
    recordPaymentEvent.mockResolvedValue({ duplicate: false });
  });

  afterEach(() => {
    delete process.env.CASHFREE_SECRET_KEY;
    vi.clearAllMocks();
  });

  it("marks the order paid for a valid signature", async () => {
    const response = await POST(webhookRequest(paidPayload));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, status: "paid", order_id: 4386 });
    expect(confirmOrderPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 4386,
        eventKey: "cashfree:PAYMENT_SUCCESS_WEBHOOK:987654321",
        transactionId: "987654321",
        amount: 1499,
      }),
    );
  });

  it("rejects a tampered body when the signature no longer matches", async () => {
    const signatureForOriginal = sign(paidPayload);
    const tampered = paidPayload.replace('"payment_amount":1499', '"payment_amount":1');

    const response = await POST(webhookRequest(tampered, { signature: signatureForOriginal }));

    expect(response.status).toBe(401);
    expect(confirmOrderPayment).not.toHaveBeenCalled();
    expect(recordPaymentEvent).not.toHaveBeenCalled();
  });

  it("rejects a signature made with the wrong secret", async () => {
    const response = await POST(webhookRequest(paidPayload, { signature: sign(paidPayload, TIMESTAMP, "wrong") }));

    expect(response.status).toBe(401);
    expect(confirmOrderPayment).not.toHaveBeenCalled();
  });

  it("rejects requests without signature headers", async () => {
    const response = await POST(
      new Request("http://localhost/api/webhooks/cashfree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: paidPayload,
      }),
    );

    expect(response.status).toBe(401);
  });

  it("rejects a validly signed webhook whose amount disagrees with the stored order", async () => {
    const body = paidPayload.replace('"payment_amount":1499', '"payment_amount":1');
    const response = await POST(webhookRequest(body));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Amount mismatch");
    expect(confirmOrderPayment).not.toHaveBeenCalled();
  });

  it("acknowledges a replayed webhook without repeating side effects", async () => {
    confirmOrderPayment.mockResolvedValue({ status: "duplicate", orderId: 4386 });

    const response = await POST(webhookRequest(paidPayload));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("duplicate");
  });

  it("ignores webhooks for orders this store does not own", async () => {
    const body = paidPayload.replace("bct-4386-abc123", "ext-9999");
    const response = await POST(webhookRequest(body));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toMatchObject({ ok: true, ignored: true });
    expect(getOrderById).not.toHaveBeenCalled();
  });

  it("records non-success payment attempts without touching order status", async () => {
    const body = JSON.stringify({
      type: "PAYMENT_FAILED_WEBHOOK",
      data: {
        order: { order_id: "bct-4386-abc123", order_amount: 1499 },
        payment: { cf_payment_id: 111, payment_status: "FAILED", payment_amount: 1499 },
      },
    });

    const response = await POST(webhookRequest(body));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe("ignored");
    expect(recordPaymentEvent).toHaveBeenCalledTimes(1);
    expect(confirmOrderPayment).not.toHaveBeenCalled();
  });
});
