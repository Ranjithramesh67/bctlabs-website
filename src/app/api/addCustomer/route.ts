import { NextResponse } from "next/server";

import {
  fileWithinKb,
  isBlank,
  isImageFile,
  readCommerceBody,
  storeFileToPublic,
  urlAttribute,
  validationMsg,
} from "@/lib/api-commerce";
import { laravelDate } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/addCustomer
 *
 * Laravel `CustomerController::addCustomer`. The customer table's `user_id`
 * column is hidden from the model's JSON.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const body = await readCommerceBody(request);
    const fail = (message: string) =>
      NextResponse.json({ status: false, message });

    if (isBlank(body.username)) return fail(validationMsg.required("username"));
    if (typeof body.username !== "string") return fail(validationMsg.string("username"));
    if (body.username.length > 255) return fail(validationMsg.maxChars("username", 255));

    if (!isBlank(body.userbusiness_name)) {
      if (typeof body.userbusiness_name !== "string")
        return fail(validationMsg.string("userbusiness_name"));
      if (body.userbusiness_name.length > 255)
        return fail(validationMsg.maxChars("userbusiness_name", 255));
    }

    if (isBlank(body.mobile_number)) return fail(validationMsg.required("mobile_number"));
    if (typeof body.mobile_number !== "string")
      return fail(validationMsg.string("mobile_number"));
    if (body.mobile_number.length > 15)
      return fail(validationMsg.maxChars("mobile_number", 15));
    const duplicate = await prisma.customers.findFirst({
      where: { mobile_number: body.mobile_number },
    });
    if (duplicate) return fail(validationMsg.unique("mobile_number"));

    if (!isBlank(body.address) && typeof body.address !== "string")
      return fail(validationMsg.string("address"));

    if (!isBlank(body.userphoto)) {
      if (!isImageFile(body.userphoto)) return fail(validationMsg.image("userphoto"));
      if (!fileWithinKb(body.userphoto, 2048))
        return fail(validationMsg.maxFile("userphoto", 2048));
    }

    if (!isBlank(body.userbusiness_photo)) {
      if (!isImageFile(body.userbusiness_photo))
        return fail(validationMsg.image("userbusiness_photo"));
      if (!fileWithinKb(body.userbusiness_photo, 2048))
        return fail(validationMsg.maxFile("userbusiness_photo", 2048));
    }

    const userphoto =
      body.userphoto instanceof File
        ? await storeFileToPublic(body.userphoto, "userphotos")
        : null;
    const userbusinessPhoto =
      body.userbusiness_photo instanceof File
        ? await storeFileToPublic(body.userbusiness_photo, "userbusinessphotos")
        : null;

    const customer = await prisma.customers.create({
      data: {
        user_id: auth.user.id,
        username: body.username,
        userbusiness_name:
          typeof body.userbusiness_name === "string"
            ? body.userbusiness_name
            : null,
        mobile_number: body.mobile_number,
        address: typeof body.address === "string" ? body.address : null,
        userphoto,
        userbusiness_photo: userbusinessPhoto,
        phone: typeof body.phone === "string" ? body.phone : null,
        currency: typeof body.currency === "string" ? body.currency : null,
        default_language:
          typeof body.default_language === "string" ? body.default_language : null,
      },
    });

    return NextResponse.json({
      status: true,
      message: "Customer added successfully.",
      data: {
        username: customer.username,
        userbusiness_name: customer.userbusiness_name,
        mobile_number: customer.mobile_number,
        address: customer.address,
        userphoto: urlAttribute(request, customer.userphoto),
        userbusiness_photo: urlAttribute(request, customer.userbusiness_photo),
        phone: customer.phone,
        currency: customer.currency,
        default_language: customer.default_language,
        created_at: laravelDate(customer.created_at),
        updated_at: laravelDate(customer.updated_at),
        id: customer.id,
      },
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to add customer.",
    });
  }
}
