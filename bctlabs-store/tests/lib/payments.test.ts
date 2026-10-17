import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
const getOrderById = vi.fn();
const markOrderPaid = vi.fn();
const triggerFulfillment = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: { bctlabs_payment_events: { create: (...args: unknown[]) => create(...args) } },
}));
vi.mock("@/lib/orders", () => ({
  getOrderById: (...args: unknown[]) => getOrderById(...args),
  markOrderPaid: (...args: unknown[]) => markOrderPaid(...args),
}));
vi.mock("@/lib/fulfillment", () => ({
  triggerFulfillment: (...args: unknown[]) => triggerFulfillment(...args),
}));

import { confirmOrderPayment, recordPaymentEvent } from "@/lib/payments";

const input = {
  eventKey: "cashfree:PAYMENT_SUCCESS_WEBHOOK:987654321",
  orderId: 4386,
  provider: "cashfree",
  eventType: "PAYMENT_SUCCESS_WEBHOOK",
  cfOrderId: "bct-4386-abc123",
  cfPaymentId: "987654321",
  amount: 1499,
  transactionId: "987654321",
};

describe("recordPaymentEvent", () => {
  afterEach(() => vi.clearAllMocks());

  it("reports a duplicate when the unique event key already exists", async () => {
    create.mockRejectedValue(Object.assign(new Error("unique"), { code: "P2002" }));
    await expect(recordPaymentEvent(input)).resolves.toEqual({ duplicate: true });
  });

  it("does not swallow unrelated database errors", async () => {
    create.mockRejectedValue(new Error("connection lost"));
    await expect(recordPaymentEvent(input)).rejects.toThrow("connection lost");
  });
});

describe("confirmOrderPayment", () => {
  beforeEach(() => {
    create.mockResolvedValue({ id: 1 });
    getOrderById.mockResolvedValue({ id: 4386, total: 1499, status: "pending", transactionId: null });
    markOrderPaid.mockResolvedValue(undefined);
    triggerFulfillment.mockResolvedValue({ ok: true });
  });

  afterEach(() => vi.clearAllMocks());

  it("marks the order paid and triggers fulfilment once", async () => {
    const result = await confirmOrderPayment(input);

    expect(result).toEqual({ status: "paid", orderId: 4386 });
    expect(markOrderPaid).toHaveBeenCalledWith(4386, {
      transactionId: "987654321",
      paymentMethod: undefined,
      paymentTitle: undefined,
    });
    expect(triggerFulfillment).toHaveBeenCalledWith(4386);
  });

  it("returns duplicate on a replayed webhook and never books a second shipment", async () => {
    create.mockRejectedValue(Object.assign(new Error("unique"), { code: "P2002" }));

    const result = await confirmOrderPayment(input);

    expect(result).toEqual({ status: "duplicate", orderId: 4386 });
    expect(markOrderPaid).not.toHaveBeenCalled();
    expect(triggerFulfillment).not.toHaveBeenCalled();
  });

  it("does not re-mark an order that is already paid", async () => {
    getOrderById.mockResolvedValue({
      id: 4386,
      total: 1499,
      status: "processing",
      transactionId: "111222",
    });

    const result = await confirmOrderPayment(input);

    expect(result).toEqual({ status: "already_paid", orderId: 4386 });
    expect(markOrderPaid).not.toHaveBeenCalled();
  });

  it("rejects an online payment for a cash-on-delivery order", async () => {
    getOrderById.mockResolvedValue({
      id: 4386,
      total: 1499,
      status: "pending",
      transactionId: null,
      paymentMethod: "cod",
    });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await confirmOrderPayment(input);

    expect(result).toEqual({ status: "rejected", orderId: 4386 });
    expect(markOrderPaid).not.toHaveBeenCalled();
    expect(triggerFulfillment).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();
  });

  it("keeps the payment confirmed when the courier call fails", async () => {
    triggerFulfillment.mockRejectedValue(new Error("nimbuspost down"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await confirmOrderPayment(input);

    expect(result).toEqual({ status: "paid", orderId: 4386 });
    expect(markOrderPaid).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalled();
  });
});
