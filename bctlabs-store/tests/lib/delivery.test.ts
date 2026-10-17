import { describe, expect, it } from "vitest";

import { shouldBlockCheckout, type DeliveryStatus } from "@/lib/delivery";

const status = (state: DeliveryStatus["state"]): DeliveryStatus => ({ state, message: "" });

describe("shouldBlockCheckout", () => {
  it("blocks until a serviceability answer arrives", () => {
    expect(shouldBlockCheckout(status("idle"), true)).toBe(true);
    expect(shouldBlockCheckout(status("checking"), true)).toBe(true);
  });

  it("blocks an explicitly unserviceable pincode", () => {
    expect(shouldBlockCheckout(status("unserviceable"), true)).toBe(true);
  });

  it("allows checkout when the carrier API is unavailable", () => {
    expect(shouldBlockCheckout(status("unavailable"), true)).toBe(false);
  });

  it("allows checkout for a serviceable pincode", () => {
    expect(shouldBlockCheckout(status("serviceable"), true)).toBe(false);
  });

  it("never blocks when logistics is disabled", () => {
    expect(shouldBlockCheckout(status("unserviceable"), false)).toBe(false);
  });
});
