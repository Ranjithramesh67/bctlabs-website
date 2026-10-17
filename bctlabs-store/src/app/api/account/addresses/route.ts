import { NextResponse } from "next/server";

import { AddressLimitError, addressInputSchema } from "@/lib/address-fields";
import { createAddress, listAddresses } from "@/lib/addresses";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: "Please sign in to manage saved addresses." }, { status: 401 });
  }
  return NextResponse.json({ addresses: await listAddresses(session.customerId) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: "Please sign in to manage saved addresses." }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
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
    const address = await createAddress(session.customerId, parsed.data);
    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    if (error instanceof AddressLimitError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    console.error("Failed to save address", error);
    return NextResponse.json({ error: "Could not save this address. Please try again." }, { status: 500 });
  }
}
