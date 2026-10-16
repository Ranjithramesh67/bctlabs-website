import { NextResponse } from "next/server";
import { z } from "zod";
import { getCart, writeCart } from "@/lib/cart";
import { getProductsByIds } from "@/lib/store";

const bodySchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(0).max(99).optional(),
});

async function summary(lines: { productId: number; quantity: number }[]) {
  return { count: lines.reduce((sum, l) => sum + l.quantity, 0), lines };
}

export async function GET() {
  const lines = await getCart();
  return NextResponse.json(await summary(lines));
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }
  const { productId, quantity = 1 } = parsed.data;
  const [product] = await getProductsByIds([productId]);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const lines = await getCart();
  const existing = lines.find((l) => l.productId === productId);
  if (existing) {
    existing.quantity = Math.min(99, existing.quantity + quantity);
  } else {
    lines.push({ productId, quantity: Math.min(99, quantity) });
  }
  await writeCart(lines);
  return NextResponse.json(await summary(lines));
}

export async function PATCH(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.quantity === undefined) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }
  const { productId, quantity } = parsed.data;
  let lines = await getCart();
  if (quantity <= 0) {
    lines = lines.filter((l) => l.productId !== productId);
  } else {
    const existing = lines.find((l) => l.productId === productId);
    if (existing) existing.quantity = Math.min(99, quantity);
    else lines.push({ productId, quantity: Math.min(99, quantity) });
  }
  await writeCart(lines);
  return NextResponse.json(await summary(lines));
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const productId = Number(url.searchParams.get("productId"));
  if (!productId) {
    await writeCart([]);
    return NextResponse.json({ count: 0, lines: [] });
  }
  const lines = (await getCart()).filter((l) => l.productId !== productId);
  await writeCart(lines);
  return NextResponse.json(await summary(lines));
}
