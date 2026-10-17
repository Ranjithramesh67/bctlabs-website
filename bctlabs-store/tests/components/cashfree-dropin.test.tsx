import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const load = vi.fn();

vi.mock("@cashfreepayments/cashfree-js", () => ({ load: (...args: unknown[]) => load(...args) }));

import { CashfreeDropIn } from "@/components/cashfree-dropin";

describe("CashfreeDropIn", () => {
  const checkout = vi.fn();

  beforeEach(() => {
    checkout.mockResolvedValue(undefined);
    load.mockResolvedValue({ checkout });
  });

  afterEach(() => vi.clearAllMocks());

  it("mounts the hosted checkout inside the container element", async () => {
    render(
      <CashfreeDropIn sessionId="session_123" mode="sandbox" onSuccess={() => {}} onFailure={() => {}} />,
    );

    expect(await screen.findByText("Payment form ready")).toBeInTheDocument();
    expect(load).toHaveBeenCalledWith({ mode: "sandbox" });
    expect(checkout).toHaveBeenCalledWith({
      paymentSessionId: "session_123",
      redirectTarget: { type: "element", container: "#cashfree-dropin-container" },
    });
    expect(screen.getByTestId("cashfree-dropin-container")).toBeInTheDocument();
  });

  it("falls back to the modal when element mode is rejected", async () => {
    checkout.mockRejectedValueOnce(new Error("element mode unavailable"));
    render(
      <CashfreeDropIn sessionId="session_123" mode="production" onSuccess={() => {}} onFailure={() => {}} />,
    );

    await screen.findByText("Payment form ready");
    await waitFor(() => expect(checkout).toHaveBeenCalledTimes(2));
    expect(checkout).toHaveBeenLastCalledWith({
      paymentSessionId: "session_123",
      redirectTarget: "_modal",
    });
  });

  it("surfaces a retryable error when the SDK cannot load", async () => {
    load.mockResolvedValue(null);
    const onFailure = vi.fn();

    render(
      <CashfreeDropIn sessionId="session_123" mode="sandbox" onSuccess={() => {}} onFailure={onFailure} />,
    );

    await waitFor(() =>
      expect(onFailure).toHaveBeenCalledWith("Could not load the payment form. Please try again."),
    );
    expect(checkout).not.toHaveBeenCalled();
  });
});
