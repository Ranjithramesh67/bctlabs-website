import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NimbusPostApiError, checkServiceability, createShipment, generateManifest } from "@/lib/nimbuspost";

function upstream(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const CONSIGNEE = {
  name: "Asha Rao",
  address: "12 MG Road",
  address2: "Flat 4B",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560001",
  phone: "+91 98765 43210",
  email: "asha@example.com",
};

describe("NimbusPost partner API v2 client", () => {
  beforeEach(() => {
    process.env.NIMBUSPOST_API_KEY = "npk_test";
    process.env.NIMBUSPOST_API_SECRET = "secret_test";
    process.env.NIMBUSPOST_BASE_URL = "https://nimbuspost.test";
    process.env.ORIGIN_PINCODE_ARK = "631001";
    process.env.NIMBUSPOST_DEFAULT_WAREHOUSE = "ARK";
  });

  afterEach(() => {
    delete process.env.NIMBUSPOST_API_KEY;
    delete process.env.NIMBUSPOST_API_SECRET;
    delete process.env.NIMBUSPOST_BASE_URL;
    delete process.env.ORIGIN_PINCODE_ARK;
    delete process.env.NIMBUSPOST_DEFAULT_WAREHOUSE;
    delete process.env.NIMBUSPOST_PICKUP_WAREHOUSE_ID;
    vi.unstubAllGlobals();
  });

  it("sends the key-pair headers and requests paise-based quotes", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      upstream({
        success: true,
        data: {
          available: [
            {
              courierId: "6a4ceb5f47ce09cc634de8ee",
              courierCode: "delhivery-surface",
              courierName: "Delhivery Surface",
              courierDisplayName: "Delhivery",
              tatDays: 6,
              result: { shippingChargesPaise: 8085, codChargesPaise: 1500, totalPaise: 9585 },
            },
          ],
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const rates = await checkServiceability({
      destinationPincode: "560001",
      weightGrams: 600,
      paymentType: "COD",
      codAmount: 1499,
    });

    expect(rates).toEqual([
      expect.objectContaining({
        courierId: "6a4ceb5f47ce09cc634de8ee",
        courierName: "Delhivery",
        freight: 80.85,
        codCharges: 15,
        total: 95.85,
        estimatedDeliveryDays: "6 days",
      }),
    ]);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://nimbuspost.test/v2/serviceability");
    expect(init.headers).toMatchObject({
      "x-api-key": "npk_test",
      "x-api-secret": "secret_test",
    });
    expect(JSON.parse(String(init.body))).toMatchObject({
      pickupPincode: "631001",
      deliveryPincode: "560001",
      paymentMode: "cod",
      packages: [{ weight: 600 }],
      orderValuePaise: 149900,
    });
  });

  it("surfaces the v2 error detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        upstream(
          {
            success: false,
            error: { title: "VALIDATION_FAILED", status: 400, detail: "pickupPincode must be a 6-digit pincode." },
          },
          400,
        ),
      ),
    );

    await expect(
      checkServiceability({ destinationPincode: "560001", weightGrams: 500, paymentType: "PREPAID" }),
    ).rejects.toMatchObject({ statusCode: 400, message: "pickupPincode must be a 6-digit pincode." });
  });

  it("books a shipment against the registered warehouse and reads the AWB", async () => {
    process.env.NIMBUSPOST_PICKUP_WAREHOUSE_ID = "671e1a2b3c4d5e6f7a8b9010";
    const fetchMock = vi.fn().mockResolvedValue(
      upstream(
        {
          success: true,
          data: {
            order: { order_id: "4391", order_status: "booked" },
            booking: {
              order_id: "4391",
              awb: "AWB123456789",
              courier_id: "6a4ceb5f47ce09cc634de8ee",
              courier_name: "Delhivery Surface",
              price: { total: 102 },
              label_url: "",
            },
          },
        },
        201,
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const booked = await createShipment({
      orderNumber: "4391",
      paymentType: "COD",
      orderAmount: 1499,
      codAmount: 1499,
      weightGrams: 750,
      consignee: CONSIGNEE,
      courierId: "6a4ceb5f47ce09cc634de8ee",
    });

    expect(booked).toMatchObject({
      awbNumber: "AWB123456789",
      shipmentId: "4391",
      courierName: "Delhivery Surface",
      courierId: "6a4ceb5f47ce09cc634de8ee",
      freight: 102,
      labelUrl: null,
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://nimbuspost.test/v2/shipments");
    expect(JSON.parse(String(init.body))).toMatchObject({
      order_number: "4391",
      order_type: "b2c",
      payment_mode: "cod",
      order_collectable_amount: 1499,
      warehouse_id: "671e1a2b3c4d5e6f7a8b9010",
      shipping_address: { pincode: 560001, phone: 9876543210 },
      package: { weight: 0.75 },
    });
  });

  it("refuses to book without a pickup warehouse", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createShipment({
        orderNumber: "4392",
        paymentType: "PREPAID",
        orderAmount: 999,
        weightGrams: 500,
        consignee: CONSIGNEE,
      }),
    ).rejects.toBeInstanceOf(NimbusPostApiError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reads the presigned manifest PDF url", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      upstream(
        {
          success: true,
          data: { manifest_id: "MAN-77", manifest_url: "https://files.nimbuspost.com/manifest.pdf" },
        },
        201,
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const manifest = await generateManifest(["AWB123456789"]);
    expect(manifest.pdfUrl).toBe("https://files.nimbuspost.com/manifest.pdf");
    expect(JSON.parse(String(fetchMock.mock.calls[0][1].body))).toEqual({ awbs: ["AWB123456789"] });
  });
});
