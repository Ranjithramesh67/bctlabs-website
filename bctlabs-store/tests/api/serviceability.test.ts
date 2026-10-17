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
    courierId: "671e1a2b3c4d5e6f7a8b9001",
    courierCode: "delhivery-express",
    courierName: "Delhivery Express",
    tatDays: 2,
    result: { shippingChargesPaise: 4500, codChargesPaise: 0, totalPaise: 4500 },
  },
  {
    courierId: "671e1a2b3c4d5e6f7a8b9002",
    courierCode: "bluedart",
    courierName: "Bluedart",
    tatDays: 1,
    result: { shippingChargesPaise: 8000, codChargesPaise: 500, totalPaise: 8500 },
  },
];

describe("POST /api/logistics/serviceability", () => {
  beforeEach(() => {
    process.env.NIMBUSPOST_API_KEY = "npk_test";
    process.env.NIMBUSPOST_API_SECRET = "test-secret";
    process.env.NIMBUSPOST_BASE_URL = "https://nimbuspost.test";
    process.env.ORIGIN_PINCODE_ARK = "631001";
    process.env.ORIGIN_PINCODE_BLR = "560001";
  });

  afterEach(() => {
    delete process.env.NIMBUSPOST_API_KEY;
    delete process.env.NIMBUSPOST_API_SECRET;
    delete process.env.NIMBUSPOST_BASE_URL;
    delete process.env.ORIGIN_PINCODE_ARK;
    delete process.env.ORIGIN_PINCODE_BLR;
    vi.unstubAllGlobals();
  });

  it("returns the cheapest live rate for a serviceable pincode", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(upstream({ success: true, data: { available: CARRIERS } }));
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
      estimated_days: "2 days",
      cheapest_courier: "Delhivery Express",
      origin_warehouse: "ARK",
    });
    expect(body.carriers).toHaveLength(2);
    // Cheapest first.
    expect(body.carriers[0].courier_name).toBe("Delhivery Express");

    const [calledUrl, init] = fetchMock.mock.calls[0];
    expect(String(calledUrl)).toBe("https://nimbuspost.test/v2/serviceability");
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe("npk_test");
    expect((init.headers as Record<string, string>)["x-api-secret"]).toBe("test-secret");
    expect(JSON.parse(String(init.body))).toMatchObject({
      pickupPincode: "631001",
      deliveryPincode: "600001",
      paymentMode: "prepaid",
      packages: [{ weight: 750 }],
    });
  });

  it("rejects an unserviceable pincode with HTTP 400", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(upstream({ success: true, data: { available: [], excluded: [] } })),
    );

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
    delete process.env.NIMBUSPOST_API_SECRET;
    const response = await POST(
      serviceabilityRequest({ destination_pincode: "600001", weight_grams: 500, payment_mode: "prepaid" }),
    );
    expect(response.status).toBe(503);
  });

  it("maps carrier outages to 502 without leaking internals", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          upstream(
            { success: false, error: { title: "INTERNAL", status: 500, detail: "upstream down" } },
            500,
          ),
        ),
    );
    const response = await POST(
      serviceabilityRequest({ destination_pincode: "600001", weight_grams: 500, payment_mode: "prepaid" }),
    );
    const body = await response.json();
    expect(response.status).toBe(502);
    expect(body.error).toBe("Could not check delivery availability.");
  });
});
