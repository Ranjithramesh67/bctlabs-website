import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/logistics/serviceability/route";

function serviceabilityRequest(body: unknown) {
  return new Request("http://localhost/api/logistics/serviceability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function upstream(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const CARRIERS = [
  {
    courier_id: 12,
    courier_name: "Delhivery Express",
    freight_charges: 45,
    cod_charges: 0,
    estimated_delivery_days: "2-3 days",
  },
  {
    courier_id: 7,
    courier_name: "Bluedart",
    freight_charges: 80,
    cod_charges: 5,
    estimated_delivery_days: "1-2 days",
  },
];

describe("POST /api/logistics/serviceability", () => {
  beforeEach(() => {
    process.env.NIMBUSPOST_API_KEY = "test-key";
    process.env.NIMBUSPOST_BASE_URL = "https://nimbuspost.test/v1";
    process.env.ORIGIN_PINCODE_ARK = "631001";
    process.env.ORIGIN_PINCODE_BLR = "560001";
  });

  afterEach(() => {
    delete process.env.NIMBUSPOST_API_KEY;
    delete process.env.NIMBUSPOST_BASE_URL;
    delete process.env.ORIGIN_PINCODE_ARK;
    delete process.env.ORIGIN_PINCODE_BLR;
    vi.unstubAllGlobals();
  });

  it("returns the cheapest live rate for a serviceable pincode", async () => {
    const fetchMock = vi.fn().mockResolvedValue(upstream({ status: true, data: CARRIERS }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      serviceabilityRequest({
        destination_pincode: "600001",
        weight_grams: 750,
        payment_mode: "prepaid",
        origin_warehouse: "ARK",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      serviceable: true,
      cheapest_rate: 45,
      estimated_days: "2-3 days",
      cheapest_courier: "Delhivery Express",
      origin_warehouse: "ARK",
    });
    expect(body.carriers).toHaveLength(2);
    // Cheapest first.
    expect(body.carriers[0].courier_name).toBe("Delhivery Express");

    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toContain("origin=631001");
    expect(calledUrl).toContain("destination=600001");
    expect(calledUrl).toContain("weight=750");
  });

  it("rejects an unserviceable pincode with HTTP 400", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(upstream({ status: true, data: [] })));

    const response = await POST(
      serviceabilityRequest({ destination_pincode: "190001", weight_grams: 500, payment_mode: "cod" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      serviceable: false,
      deliverable: false,
      reason: "Pincode not serviceable",
      carriers: [],
    });
  });

  it("validates the pincode before calling the carrier API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(serviceabilityRequest({ destination_pincode: "abc", weight_grams: 500 }));

    expect(response.status).toBe(422);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 503 when logistics is not configured", async () => {
    delete process.env.NIMBUSPOST_API_KEY;
    const response = await POST(
      serviceabilityRequest({ destination_pincode: "600001", weight_grams: 500, payment_mode: "prepaid" }),
    );
    expect(response.status).toBe(503);
  });

  it("maps carrier outages to 502 without leaking internals", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(upstream({ status: false, message: "upstream down" }, 500)),
    );
    const response = await POST(
      serviceabilityRequest({ destination_pincode: "600001", weight_grams: 500, payment_mode: "prepaid" }),
    );
    const body = await response.json();
    expect(response.status).toBe(502);
    expect(body.error).toBe("Could not check delivery availability.");
  });
});
