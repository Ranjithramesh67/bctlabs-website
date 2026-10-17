import "server-only";

import { NimbusPostApiError, generateManifest } from "./nimbuspost";
import { getShipmentByAwb, saveManifest } from "./shipments";

export type ManifestRequest = {
  awbs: string[];
  courierName?: string;
};

export type ManifestResult =
  | {
      ok: true;
      courierName: string;
      awbs: string[];
      pdfUrl: string | null;
      batchReference: string;
    }
  | {
      ok: false;
      status: number;
      error: string;
      unknownAwbs?: string[];
      couriers?: string[];
    };

/**
 * Build one manifest PDF for a set of AWBs from the same courier.
 *
 * A manifest is handed to a single courier, so mixed-courier lists are
 * rejected rather than silently grouped into an unusable PDF.
 */
export async function buildManifest(input: ManifestRequest): Promise<ManifestResult> {
  const awbs = Array.from(new Set(input.awbs.map((awb) => awb.trim()).filter(Boolean)));
  if (!awbs.length) return { ok: false, status: 422, error: "Select at least one AWB." };

  const shipments = await Promise.all(awbs.map((awb) => getShipmentByAwb(awb)));
  const unknownAwbs = awbs.filter((_, index) => !shipments[index]);
  if (unknownAwbs.length) {
    return { ok: false, status: 404, error: "Some AWBs are not in this store.", unknownAwbs };
  }

  const couriers = Array.from(
    new Set(shipments.map((shipment) => shipment?.courierName).filter((name): name is string => Boolean(name))),
  );
  if (couriers.length > 1) {
    return {
      ok: false,
      status: 400,
      error: "All AWBs in a manifest must belong to the same courier.",
      couriers,
    };
  }
  const courierName = input.courierName || couriers[0] || "NimbusPost";

  try {
    const manifest = await generateManifest(awbs);
    const batch = await saveManifest(courierName, awbs, manifest.pdfUrl);
    return {
      ok: true,
      courierName,
      awbs,
      pdfUrl: manifest.pdfUrl,
      batchReference: `MAN-${batch.id}`,
    };
  } catch (error) {
    if (error instanceof NimbusPostApiError) {
      console.error("NimbusPost manifest failed", error.statusCode, error.details);
      return {
        ok: false,
        status: error.statusCode >= 500 ? 502 : error.statusCode,
        error: error.message,
      };
    }
    console.error("Unexpected manifest error", error);
    return { ok: false, status: 500, error: "Could not generate the manifest." };
  }
}
