import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api-token";
import { logoUrl, profilePictureUrl } from "@/lib/api-users";

export const instant = false;

type OsmLocation = { city: string | null; area: string | null; state: string | null };

/**
 * Port of `AuthController::getLocationFromOSM` (Nominatim reverse geocoding).
 * Failures and non-200 responses resolve to `null`, exactly like the original.
 */
async function getLocationFromOsm(
  latitude: string | null,
  longitude: string | null,
): Promise<OsmLocation | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude ?? ""}&lon=${longitude ?? ""}&format=json`;
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Laravel App", Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status !== 200) {
      return null;
    }
    const data = (await response.json()) as {
      address?: Record<string, string>;
    };
    const address = data.address ?? {};
    return {
      city: address.city ?? address.town ?? address.village ?? null,
      area: address.county ?? null,
      state: address.state ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * GET /api/getProfile
 *
 * Laravel `AuthController::getProfile`.
 */
export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const { user } = auth;
    const location = await getLocationFromOsm(user.latitude, user.longitude);

    return NextResponse.json({
      status: true,
      message: "Profile fetched successfully",
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        alternate_number: user.alternate_number,
        name: user.first_name,
        business_name: user.business_name,
        address: user.address,
        status: user.is_enable ? "active" : "inactive",
        profile_picture_url: await profilePictureUrl(request, user),
        logo_url: await logoUrl(request, user),
        location,
        is_profile_update: user.is_profile_update,
        secondary_mobile_verified: Number(user.secondary_mobile_verified),
      },
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Something went wrong",
      data: [],
    });
  }
}
