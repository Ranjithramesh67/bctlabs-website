import { NextResponse } from "next/server";
import { z } from "zod";
import {
  NimbusPostApiError,
  checkServiceability,
  cheapestOption,
  defaultWarehouse,
  isNimbusPostConfigured,
  isWarehouseCode,
  originPincode,
} from "@/lib/nimbuspost";

const bodySchema = z.object({
  destination_pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6 digit pincode"),
  weight_grams: z.coerce.number().int().positive().max(50000, "Weight is too high").optional(),
  weight: z.coerce.number().int().positive().max(50000, "Weight is too high").optional(),
  payment_mode: z.enum(["prepaid", "cod", "PREPAID", "COD"]).optional(),
  payment_type: z.enum(["COD", "Prepaid", "PREPAID", "cod", "prepaid"]).optional(),
  cod_amount: z.coerce.number().min(0).optional().default(0),
  origin_warehouse: z.enum(["BLR", "ARK", "blr", "ark"]).optional(),
  origin_pincode: z.string().trim().regex(/^\d{6}$/).optional(),
});

/**
 * Check delivery availability for a pincode.
 *
 * The answer always comes from the live NimbusPost API; no pincode list is
 * cached in this app. An empty courier list is a 400 so checkout can block
 * the order instead of accepting an undeliverable address.
 */
export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  if (raw === null || typeof raw !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Please check the delivery details.",
        fields: Object.fromEntries(
          parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
        ),
        serviceable: false,
        deliverable: false,
        carriers: [],
      },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const weightGrams = data.weight_grams ?? data.weight;
  if (!weightGrams) {
    return NextResponse.json(
      { error: "Package weight is required.", serviceable: false, deliverable: false, carriers: [] },
      { status: 422 },
    );
  }

  const mode = (data.payment_mode ?? data.payment_type ?? "prepaid").toUpperCase();
  const paymentType = mode === "COD" ? "COD" : "PREPAID";
  const requestedWarehouse = data.origin_warehouse?.toUpperCase();
  // Legacy callers send a raw origin pincode; only accept it when it matches a
  // configured warehouse so clients cannot pick arbitrary origins.
  const originWarehouse = isWarehouseCode(requestedWarehouse)
    ? requestedWarehouse
    : data.origin_pincode && data.origin_pincode === originPincode("BLR")
      ? "BLR"
      : data.origin_pincode && data.origin_pincode === originPincode("ARK")
        ? "ARK"
        : defaultWarehouse();

  if (!isNimbusPostConfigured()) {
    return NextResponse.json(
      {
        error: "Delivery check is not available right now.",
        serviceable: false,
        deliverable: false,
        carriers: [],
      },
      { status: 503 },
    );
  }

  try {
    const carriers = await checkServiceability({
      destinationPincode: data.destination_pincode,
      weightGrams,
      paymentType,
      codAmount: paymentType === "COD" ? data.cod_amount : 0,
      originWarehouse,
    });

    if (!carriers.length) {
      return NextResponse.json(
        {
          error: `Sorry, we cannot deliver to pincode ${data.destination_pincode} yet.`,
          reason: "Pincode not serviceable",
          serviceable: false,
          deliverable: false,
          carriers: [],
        },
        { status: 400 },
      );
    }

    const cheapest = cheapestOption(carriers)!;
    const serialized = carriers.map((carrier) => ({
      courier_id: carrier.courierId,
      courier_name: carrier.courierName,
      freight: carrier.freight,
      cod_charges: carrier.codCharges,
      total: carrier.total,
      estimated_delivery_days: carrier.estimatedDeliveryDays,
    }));

    return NextResponse.json({
      serviceable: true,
      deliverable: true,
      destination_pincode: data.destination_pincode,
      origin_warehouse: originWarehouse ?? null,
      payment_mode: paymentType === "COD" ? "cod" : "prepaid",
      cheapest_rate: cheapest.total,
      estimated_days: cheapest.estimatedDeliveryDays,
      cheapest_courier: cheapest.courierName,
      cheapest: {
        courier_id: cheapest.courierId,
        courier_name: cheapest.courierName,
        freight: cheapest.freight,
        cod_charges: cheapest.codCharges,
        total: cheapest.total,
        estimated_delivery_days: cheapest.estimatedDeliveryDays,
      },
      carriers: serialized,
    });
  } catch (error) {
    if (error instanceof NimbusPostApiError) {
      console.error("NimbusPost serviceability failed", error.statusCode, error.details);
      return NextResponse.json(
        {
          error: error.statusCode === 503 ? error.message : "Could not check delivery availability.",
          serviceable: false,
          deliverable: false,
          carriers: [],
        },
        { status: error.statusCode === 503 ? 503 : 502 },
      );
    }
    console.error("Unexpected serviceability error", error);
    return NextResponse.json(
      {
        error: "Could not check delivery availability.",
        serviceable: false,
        deliverable: false,
        carriers: [],
      },
      { status: 500 },
    );
  }
}
