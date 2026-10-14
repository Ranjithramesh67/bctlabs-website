import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { loadCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

/** PHP `UploadedFile::getClientOriginalExtension()`. */
function fileExtension(file: File): string {
  const fromName = path.extname(file.name).replace(/^\./, "").toLowerCase();
  return fromName || EXTENSION_BY_MIME[file.type] || "";
}

/** Laravel `ChatController::sendadminMessage`. */
export async function POST(request: Request) {
  const user = await loadCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  // Laravel's `$request->all()` yields an empty array for a body it cannot
  // parse; mirror that instead of throwing on a missing multipart payload.
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    form = new FormData();
  }
  const rawMessage = form.get("message");
  const rawUserId = form.get("user_id");
  const rawType = form.get("type");
  const rawFile = form.get("file");

  const errors: Record<string, string[]> = {};

  const messageValue = typeof rawMessage === "string" ? rawMessage : null;
  if (rawMessage !== null && messageValue === null) {
    errors.message = ["The message field must be a string."];
  }

  const userId = typeof rawUserId === "string" ? rawUserId : "";
  if (userId === "") {
    errors.user_id = ["The user id field is required."];
  }

  const type = typeof rawType === "string" ? rawType : "";
  if (type === "") {
    errors.type = ["The type field is required."];
  } else if (type !== "text" && type !== "image") {
    errors.type = ["The selected type is invalid."];
  }

  const file = rawFile instanceof File && rawFile.size > 0 ? rawFile : null;
  if (file) {
    if (!file.type.startsWith("image/")) {
      errors.file = ["The file field must be an image."];
    } else if (file.size > 2048 * 1024) {
      errors.file = [
        "The file field must not be greater than 2048 kilobytes.",
      ];
    }
  }

  if (userId !== "") {
    const existing = /^\d+$/.test(userId)
      ? await prisma.users.findUnique({
          where: { id: Number(userId) },
          select: { id: true },
        })
      : null;
    if (!existing) {
      errors.user_id = ["The selected user id is invalid."];
    }
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { message: "The given data was invalid.", errors },
      { status: 422 },
    );
  }

  // Mind the original typo: the ticket id comes from `suport_id`, not `user_id`.
  const rawSupportId = form.get("suport_id");
  const supportTicketId =
    typeof rawSupportId === "string" && /^\d+$/.test(rawSupportId)
      ? BigInt(rawSupportId)
      : null;

  let adminMessage: string | null = null;
  let attachment: string | null = null;

  if (type === "text") {
    adminMessage = messageValue;
  } else if (file) {
    const timestamp = Math.floor(Date.now() / 1000);
    const filename = `${timestamp}_send_message_image_.${fileExtension(file)}`;
    const directory = path.join(process.cwd(), "public", "support-ticket");
    await mkdir(directory, { recursive: true });
    await writeFile(
      path.join(directory, filename),
      Buffer.from(await file.arrayBuffer()),
    );
    attachment = `support-ticket/${filename}`;
  }

  await prisma.support_ticket_convs.create({
    data: {
      support_ticket_id: supportTicketId,
      admin_id: BigInt(user.id),
      msg_type: type,
      position: 1,
      admin_message: adminMessage,
      attachment,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return NextResponse.json({ status: true });
}
