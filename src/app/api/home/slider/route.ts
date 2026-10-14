import { NextResponse } from "next/server";

import { serializeCommerce } from "@/lib/api-commerce";
import { laravelUrl } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/home/slider
 *
 * Laravel `CategoryController::getSliderImage`. When no active slider falls in
 * today's window the controller returns a hard-coded fallback row.
 */
export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const today = new Date().toISOString().slice(0, 10);

    const sliders = await prisma.sliders.findMany({
      where: {
        status: 1,
        start_date: { lte: today },
        end_date: { gte: today },
      },
      orderBy: { id: "asc" },
    });

    const data =
      sliders.length === 0
        ? [
            {
              id: 0,
              slider_title: "ipl",
              slider_image: laravelUrl(request, "slider_image/slider_1.png"),
              slider_description: "cricket",
              state_id: 35,
              start_date: "2025-04-18",
              end_date: "2025-05-20",
              status: 1,
              created_at: "2025-04-18T13:57:28.000000Z",
              updated_at: "2025-04-18T13:57:28.000000Z",
            },
          ]
        : sliders.map((slider) => {
            const item = serializeCommerce(slider) as Record<string, unknown>;
            item.slider_image = slider.slider_image
              ? laravelUrl(request, slider.slider_image)
              : "";
            return item;
          });

    return NextResponse.json({
      status: true,
      message: "Home Slider fetched successfully.",
      data,
    });
  } catch (error) {
    return NextResponse.json({
      status: false,
      message: `Failed to fetch slider.${
        error instanceof Error ? error.message : ""
      }`,
    });
  }
}
