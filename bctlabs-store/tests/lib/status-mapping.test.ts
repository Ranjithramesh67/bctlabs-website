import { describe, expect, it } from "vitest";

import { normalizeOrderStatus, orderStatusLabel, truncate } from "@/lib/format";
import { mapTrackingStatus } from "@/lib/nimbuspost";

describe("mapTrackingStatus", () => {
  it("recognises delivered and out-for-delivery states", () => {
    expect(mapTrackingStatus("Delivered")).toBe("DELIVERED");
    expect(mapTrackingStatus("OUT_FOR_DELIVERY")).toBe("OUT_FOR_DELIVERY");
    expect(mapTrackingStatus("OFD")).toBe("OUT_FOR_DELIVERY");
  });

  it("does not treat failed deliveries as delivered", () => {
    expect(mapTrackingStatus("UNDELIVERED")).toBe("EXCEPTION");
    expect(mapTrackingStatus("NOT_DELIVERED")).toBe("EXCEPTION");
    expect(mapTrackingStatus("DELIVERY_FAILED")).toBe("EXCEPTION");
  });

  it("maps failed pickups to an exception, not a scheduled pickup", () => {
    expect(mapTrackingStatus("PICKUP_FAILED")).toBe("EXCEPTION");
    expect(mapTrackingStatus("PICKED_UP")).toBe("PICKED_UP");
    expect(mapTrackingStatus("Pickup Scheduled")).toBe("PICKUP_SCHEDULED");
  });

  it("keeps RTO deliveries distinct", () => {
    expect(mapTrackingStatus("RTO DELIVERED")).toBe("RTO_DELIVERED");
    expect(mapTrackingStatus("RTO_IN_TRANSIT")).toBe("RTO_IN_TRANSIT");
  });
});

describe("normalizeOrderStatus", () => {
  it("strips the legacy wc- prefix", () => {
    expect(normalizeOrderStatus("wc-completed")).toBe("completed");
    expect(normalizeOrderStatus("processing")).toBe("processing");
    expect(normalizeOrderStatus(null)).toBe("");
    expect(orderStatusLabel("wc-cancelled")).toBe("Cancelled");
  });
});

describe("truncate", () => {
  it("never leaks embedded stylesheet text into meta descriptions", () => {
    const html = "<style>.elm-organic{color:red}</style><p>Genuine parts for makers.</p>";
    expect(truncate(html, 160)).toBe("Genuine parts for makers.");
  });
});
