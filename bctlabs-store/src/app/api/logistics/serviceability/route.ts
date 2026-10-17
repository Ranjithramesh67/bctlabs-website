import { NextResponse } from "next/server";
import { z } from "zod";
import {
  NimbusPostApiError,
  checkServiceability,
  cheapestOption,
  isNimbusPostConfigured,
} from "@/lib/nimbuspost";

const bodySchema = z.object({
  origin_pincode: z.string().trim().regex(/^\d{6}$/, "Origin pincode must be 6 digits").optional(),
  destination_pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6 digit pincode"),
  weight: z.coerce.number().int().positive().max(50000, "Weight is too high"),
  payment_type: z.enum(["COD", "Prepaid", "PREPAID", "cod", "prepaid"]),
  cod_amount: z.coerce.number().min(0).optional().default(0),
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
        deliverable: false,
        carriers: [],
      },
      { status: 422 },
    );
  }

  const { destination_pincode, weight, cod_amount } = parsed.data;
  const paymentType = parsed.data.payment_type.toUpperCase() === "COD" ? "COD" : "PREPAID";

  if (!isNimbusPostConfigured()) {
    return NextResponse.json(
      { error: "Delivery check is not available right now.", deliverable: false, carriers: [] },
      { status: 503 },
    );
  }

  try {
    const carriers = await checkServiceability({
      destinationPincode: destination_pincode,
      weightGrams: weight,
      paymentType,
      codAmount: paymentType === "COD" ? cod_amount : 0,
    });

    if (!carriers.length) {
      return NextResponse.json(
        {
          error: `Sorry, we cannot deliver to pincode ${destination_pincode} yet.`,
          deliverable: false,
          carriers: [],
        },
        { status: 400 },
      );
    }

    const cheapest = cheapestOption(carriers)!;
    return NextResponse.json({
      deliverable: true,
      destination_pincode,
      payment_type: paymentType,
      cheapest: {
        courier_id: cheapest.courierId,
        courier_name: cheapest.courierName,
        freight: cheapest.freight,
        cod_charges: cheapest.codCharges,
        total: cheapest.total,
        estimated_delivery_days: cheapest.estimatedDeliveryDays,
      },
      carriers: carriers.map((carrier) => ({
        courier_id: carrier.courierId,
        courier_name: carrier.courierName,
        freight: carrier.freight,
        cod_charges: carrier.codCharges,
        total: carrier.total,
        estimated_delivery_days: carrier.estimatedDeliveryDays,
      })),
    });
  } catch (error) {
    if (error instanceof NimbusPostApiError) {
      console.error("NimbusPost serviceability failed", error.statusCode, error.details);
      return NextResponse.json(
        {
          error: error.statusCode === 503 ? error.message : "Could not check delivery availability.",
          deliverable: false,
          carriers: [],
        },
        { status: error.statusCode === 503 ? 503 : 502 },
      );
    }
    console.error("Unexpected serviceability error", error);
    return NextResponse.json(
      { error: "Could not check delivery availability.", deliverable: false, carriers: [] },
      { status: 500 },
    );
  }
}
