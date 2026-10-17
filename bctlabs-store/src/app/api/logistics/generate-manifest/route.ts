import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession, isStaffUser } from "@/lib/admin-auth";
import { NimbusPostApiError, generateManifest, isNimbusPostConfigured } from "@/lib/nimbuspost";
import { getShipmentByAwb, saveManifest } from "@/lib/shipments";

const bodySchema = z.object({
  // Grouped by courier on the client so each manifest belongs to one pickup.
  courier_name: z.string().trim().min(1).optional(),
  awbs: z.array(z.string().trim().min(1)).min(1, "Select at least one AWB").max(100),
});

/**
 * Generate a single manifest PDF for the selected AWBs.
 *
 * Staff-only. A manifest is handed to one courier, so AWBs from different
 * couriers are rejected rather than silently mixed into one PDF.
 */
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session.userId || !(await isStaffUser(session.userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isNimbusPostConfigured()) {
    return NextResponse.json({ error: "NimbusPost is not configured." }, { status: 503 });
  }

  const raw = await request.json().catch(() => null);
  if (raw === null || typeof raw !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 422 });
  }

  const awbs = Array.from(new Set(parsed.data.awbs));
  const shipments = await Promise.all(awbs.map((awb) => getShipmentByAwb(awb)));
  const unknown = awbs.filter((_, index) => !shipments[index]);
  if (unknown.length) {
    return NextResponse.json(
      { error: "Some AWBs are not in this store.", unknown_awbs: unknown },
      { status: 404 },
    );
  }

  const couriers = Array.from(
    new Set(shipments.map((shipment) => shipment?.courierName).filter((name): name is string => Boolean(name))),
  );
  if (couriers.length > 1) {
    return NextResponse.json(
      { error: "All AWBs in a manifest must belong to the same courier.", couriers },
      { status: 400 },
    );
  }
  const courierName = parsed.data.courier_name || couriers[0] || "NimbusPost";

  try {
    const manifest = await generateManifest(awbs);
    await saveManifest(courierName, awbs, manifest.pdfUrl);
    return NextResponse.json({
      ok: true,
      courier_name: courierName,
      awbs,
      pdf_url: manifest.pdfUrl,
    });
  } catch (error) {
    if (error instanceof NimbusPostApiError) {
      console.error("NimbusPost manifest failed", error.statusCode, error.details);
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode >= 500 ? 502 : error.statusCode },
      );
    }
    console.error("Unexpected manifest error", error);
    return NextResponse.json({ error: "Could not generate the manifest." }, { status: 500 });
  }
}
