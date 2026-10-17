import { NextResponse } from "next/server";

import { addressInputSchema } from "@/lib/address-fields";
import { deleteAddress, setDefaultAddress, updateAddress } from "@/lib/addresses";
import { getSession } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: "Please sign in to manage saved addresses." }, { status: 401 });
  }
  const id = parseId((await context.params).id);
  if (!id) return NextResponse.json({ error: "Address not found." }, { status: 404 });

  const raw = await request.json().catch(() => null);

  // "Set as default" only sends { isDefault: true }; everything else is a full edit.
  if (raw && typeof raw === "object" && Object.keys(raw).length === 1 && "isDefault" in raw) {
    const address = await setDefaultAddress(session.customerId, id);
    if (!address) return NextResponse.json({ error: "Address not found." }, { status: 404 });
    return NextResponse.json({ address });
  }

  const parsed = addressInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fields[key]) fields[key] = issue.message;
    }
    return NextResponse.json(
      { error: "Please correct the highlighted fields.", fields },
      { status: 422 },
    );
  }

  try {
    const address = await updateAddress(session.customerId, id, parsed.data);
    if (!address) return NextResponse.json({ error: "Address not found." }, { status: 404 });
    return NextResponse.json({ address });
  } catch (error) {
    console.error("Failed to update address", error);
    return NextResponse.json({ error: "Could not update this address. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: "Please sign in to manage saved addresses." }, { status: 401 });
  }
  const id = parseId((await context.params).id);
  if (!id) return NextResponse.json({ error: "Address not found." }, { status: 404 });

  const removed = await deleteAddress(session.customerId, id);
  if (!removed) return NextResponse.json({ error: "Address not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
