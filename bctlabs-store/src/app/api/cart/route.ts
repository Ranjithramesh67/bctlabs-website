import { NextResponse } from "next/server";
import { z } from "zod";
import { getCart, writeCart } from "@/lib/cart";
import { getProductsByIds } from "@/lib/store";

const addSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(99).optional(),
});

const patchSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(0).max(99),
});

async function summary(lines: { productId: number; quantity: number }[]) {
  return { count: lines.reduce((sum, l) => sum + l.quantity, 0), lines };
}

/**
 * Products without a price are quote-only, and out-of-stock products cannot be
 * purchased. Backorders stay available because the store intentionally accepts
 * them.
 */
function unavailableReason(product: { price: number; stockStatus: string }): string | null {
  if (!(product.price > 0)) return "This product is available by enquiry only.";
  if (product.stockStatus === "outofstock") return "This product is out of stock.";
  return null;
}

export async function GET() {
  const lines = await getCart();
  return NextResponse.json(await summary(lines));
}

export async function POST(request: Request) {
  const parsed = addSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }
  const { productId, quantity = 1 } = parsed.data;
  const [product] = await getProductsByIds([productId]);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const unavailable = unavailableReason(product);
  if (unavailable) {
    return NextResponse.json({ error: unavailable }, { status: 409 });
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
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }
  const { productId, quantity } = parsed.data;
  let lines = await getCart();
  if (quantity <= 0) {
    lines = lines.filter((l) => l.productId !== productId);
  } else {
    const [product] = await getProductsByIds([productId]);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const unavailable = unavailableReason(product);
    if (unavailable) {
      return NextResponse.json({ error: unavailable }, { status: 409 });
    }
    const existing = lines.find((l) => l.productId === productId);
    if (existing) existing.quantity = Math.min(99, quantity);
    else lines.push({ productId, quantity: Math.min(99, quantity) });
  }
  await writeCart(lines);
  return NextResponse.json(await summary(lines));
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("productId");
  const productId = Number(raw);
  if (!raw || !Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: "A valid productId is required" }, { status: 422 });
  }
  const lines = (await getCart()).filter((l) => l.productId !== productId);
  await writeCart(lines);
  return NextResponse.json(await summary(lines));
}
