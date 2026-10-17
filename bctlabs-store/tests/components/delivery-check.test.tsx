import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

import { DeliveryCheck } from "@/components/delivery-check";
import type { DeliveryStatus } from "@/lib/delivery";

function renderCheck(overrides: Partial<Parameters<typeof DeliveryCheck>[0]> = {}) {
  const onStatusChange = vi.fn<(status: DeliveryStatus) => void>();
  render(
    <DeliveryCheck
      pincode="600001"
      weightGrams={500}
      paymentMode="prepaid"
      enabled
      onStatusChange={onStatusChange}
      {...overrides}
    />,
  );
  return { onStatusChange };
}

describe("DeliveryCheck", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("shows the cheapest live courier for a serviceable pincode", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        serviceable: true,
        cheapest_rate: 45,
        estimated_days: "2-3 days",
        cheapest_courier: "Delhivery Express",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { onStatusChange } = renderCheck();

    expect(screen.getByTestId("delivery-status")).toHaveTextContent("Checking delivery availability");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(screen.getByText("Delivery in 2-3 days via Delhivery Express")).toBeInTheDocument();
    expect(onStatusChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ state: "serviceable", cheapestRate: 45, courierName: "Delhivery Express" }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body).toEqual({
      destination_pincode: "600001",
      weight_grams: 500,
      payment_mode: "prepaid",
    });
  });

  it("blocks with an explicit message when the pincode is unserviceable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          { serviceable: false, error: "Sorry, we cannot deliver to pincode 190001 yet." },
          { status: 400 },
        ),
      ),
    );

    const { onStatusChange } = renderCheck({ pincode: "190001" });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(screen.getByText("Sorry, we cannot deliver to pincode 190001 yet.")).toBeInTheDocument();
    expect(onStatusChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ state: "unserviceable" }),
    );
  });

  it("degrades to unavailable (checkout still allowed) on a gateway outage", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({}, { status: 503 })));

    const { onStatusChange } = renderCheck();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(screen.getByText("Delivery estimate unavailable right now")).toBeInTheDocument();
    expect(onStatusChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ state: "unavailable" }),
    );
  });

  it("does not call the API for an incomplete pincode", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { onStatusChange } = renderCheck({ pincode: "6000" });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(onStatusChange).toHaveBeenLastCalledWith(expect.objectContaining({ state: "idle" }));
  });

  it("debounces rapid pincode edits into a single request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ serviceable: true }));
    vi.stubGlobal("fetch", fetchMock);

    const { rerender } = render(
      <DeliveryCheck
        pincode="6000"
        weightGrams={500}
        paymentMode="prepaid"
        enabled
        onStatusChange={() => {}}
      />,
    );
    rerender(
      <DeliveryCheck
        pincode="600001"
        weightGrams={500}
        paymentMode="prepaid"
        enabled
        onStatusChange={() => {}}
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.destination_pincode).toBe("600001");
  });
});
