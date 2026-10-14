import { NextResponse } from "next/server";

import {
  deleteFileFromPublic,
  fileWithinKb,
  hasMime,
  isBlank,
  isImageFile,
  readCommerceBody,
  serializeCommerce,
  storeFileToPublic,
  urlAttribute,
  validationMsg,
} from "@/lib/api-commerce";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/updateCustomer/{id}
 *
 * Laravel `CustomerController::updateCustomer`.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const customerId = /^-?\d+$/.test(id) ? Number(id) : null;
    const customer =
      customerId === null
        ? null
        : await prisma.customers.findUnique({ where: { id: customerId } });
    if (!customer) {
      return NextResponse.json({
        status: false,
        message: "Customer not found.",
      });
    }

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
    const duplicate = await prisma.customers.findFirst({
      where: { mobile_number: body.mobile_number, id: { not: customer.id } },
    });
    if (duplicate) return fail(validationMsg.unique("mobile_number"));

    if (!isBlank(body.address) && typeof body.address !== "string")
      return fail(validationMsg.string("address"));

    if (!isBlank(body.userphoto)) {
      if (!isImageFile(body.userphoto)) return fail(validationMsg.image("userphoto"));
      if (!hasMime(body.userphoto, ["jpeg", "png", "jpg", "gif"]))
        return fail(validationMsg.mimes("userphoto", "jpeg,png,jpg,gif"));
      if (!fileWithinKb(body.userphoto, 2048))
        return fail(validationMsg.maxFile("userphoto", 2048));
    }
    if (!isBlank(body.userbusiness_photo)) {
      if (!isImageFile(body.userbusiness_photo))
        return fail(validationMsg.image("userbusiness_photo"));
      if (!hasMime(body.userbusiness_photo, ["jpeg", "png", "jpg", "gif"]))
        return fail(validationMsg.mimes("userbusiness_photo", "jpeg,png,jpg,gif"));
      if (!fileWithinKb(body.userbusiness_photo, 2048))
        return fail(validationMsg.maxFile("userbusiness_photo", 2048));
    }

    let userphoto = customer.userphoto;
    let userbusinessPhoto = customer.userbusiness_photo;
    if (body.userphoto instanceof File) {
      await deleteFileFromPublic(customer.userphoto);
      userphoto = await storeFileToPublic(body.userphoto, "userphotos");
    }
    if (body.userbusiness_photo instanceof File) {
      await deleteFileFromPublic(customer.userbusiness_photo);
      userbusinessPhoto = await storeFileToPublic(
        body.userbusiness_photo,
        "userbusinessphotos",
      );
    }

    const updated = await prisma.customers.update({
      where: { id: customer.id },
      data: {
        username: body.username,
        userbusiness_name:
          typeof body.userbusiness_name === "string"
            ? body.userbusiness_name
            : null,
        mobile_number: body.mobile_number,
        address: typeof body.address === "string" ? body.address : null,
        userphoto,
        userbusiness_photo: userbusinessPhoto,
      },
    });

    const data = serializeCommerce(updated) as Record<string, unknown>;
    delete data.user_id;
    data.userphoto = urlAttribute(request, updated.userphoto);
    data.userbusiness_photo = urlAttribute(request, updated.userbusiness_photo);

    return NextResponse.json({
      status: true,
      message: "Customer updated successfully.",
      data,
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to update customer.",
    });
  }
}
