import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession, isStaffUser } from "@/lib/admin-auth";
import { buildManifest } from "@/lib/manifest";
import { isNimbusPostConfigured } from "@/lib/nimbuspost";

const bodySchema = z.object({
  awbs: z.array(z.string().trim().min(1)).min(1, "Select at least one AWB").max(100),
  courier_name: z.string().trim().min(1).optional(),
  courier_id: z.union([z.string(), z.number()]).optional(),
});

/** Staff-only manifest generation (legacy path). */
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

  const result = await buildManifest({
    awbs: parsed.data.awbs,
    courierName: parsed.data.courier_name,
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, unknown_awbs: result.unknownAwbs, couriers: result.couriers },
      { status: result.status },
    );
  }

  return NextResponse.json({
    ok: true,
    courier_name: result.courierName,
    awbs: result.awbs,
    pdf_url: result.pdfUrl,
  });
}
