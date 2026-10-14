import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/verifyDevice
 *
 * Laravel `AuthController::verifyDevice`.
 */
export async function POST(request: Request) {
  const body = await readRequestBody(request);

  const phone = body.phone;
  if (phone === undefined || phone === null || phone === "") {
    return NextResponse.json({
      status: false,
      message: "The phone field is required.",
    });
  }
  if (typeof phone !== "string") {
    return NextResponse.json({
      status: false,
      message: "The phone field must be a string.",
    });
  }
  if (body.device_id === undefined || body.device_id === null || body.device_id === "") {
    return NextResponse.json({
      status: false,
      message: "The device id field is required.",
    });
  }
  if (
    body.verification_code === undefined ||
    body.verification_code === null ||
    body.verification_code === ""
  ) {
    return NextResponse.json({
      status: false,
      message: "The verification code field is required.",
    });
  }

  const user = await prisma.users.findFirst({ where: { phone } });
  if (!user) {
    return NextResponse.json({
      status: false,
      message: "The selected phone is invalid.",
    });
  }

  if (user.verification_code !== String(body.verification_code)) {
    return NextResponse.json({
      status: false,
      message: "Invalid verification code.",
    });
  }

  await prisma.users.update({
    where: { id: user.id },
    data: { is_verified_device: 1, device_id: String(body.device_id) },
  });

  return NextResponse.json({
    status: true,
    message: "Device verified successfully.",
  });
}
