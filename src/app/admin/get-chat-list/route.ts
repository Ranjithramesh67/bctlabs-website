import { NextResponse } from "next/server";

import { laravelDate } from "@/lib/api-format";
import { USER_MODEL_TYPE } from "@/lib/api-token";
import { profilePictureUrl } from "@/lib/api-users";
import { loadCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

/** PHP `ucwords()`. */
function ucwords(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

/** `User::getRoleNamesAttribute()` -> `implode(',', roles->pluck('display_name'))`. */
async function roleNamesByUser(
  userIds: number[],
): Promise<Map<number, string>> {
  if (userIds.length === 0) {
    return new Map();
  }

  const assignments = await prisma.model_has_roles.findMany({
    where: {
      model_id: { in: userIds.map((id) => BigInt(id)) },
      model_type: USER_MODEL_TYPE,
    },
  });
  if (assignments.length === 0) {
    return new Map();
  }

  const roleIds = [...new Set(assignments.map((row) => row.role_id))];
  const roles = await prisma.roles.findMany({
    where: { id: { in: roleIds } },
    orderBy: { id: "asc" },
  });
  const nameById = new Map(
    roles.map((role) => [Number(role.id), role.display_name ?? ""]),
  );

  const byUser = new Map<number, string[]>();
  for (const assignment of assignments) {
    const uid = Number(assignment.model_id);
    const list = byUser.get(uid) ?? [];
    list.push(nameById.get(Number(assignment.role_id)) ?? "");
    byUser.set(uid, list);
  }

  return new Map([...byUser].map(([uid, list]) => [uid, list.join(",")]));
}

/** Laravel `ChatController::getChatList`. */
export async function GET(request: Request) {
  const user = await loadCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const userId = user.id;
  const messages = await prisma.admin_chat_messages.findMany({
    where: {
      OR: [{ sender_id: BigInt(userId) }, { receiver_id: BigInt(userId) }],
    },
    select: { sender_id: true, receiver_id: true, created_at: true },
  });

  // CASE WHEN sender_id = me THEN receiver_id ELSE sender_id END, grouped with MAX(created_at).
  const lastMessageAt = new Map<number, Date>();
  for (const message of messages) {
    const other =
      message.sender_id === BigInt(userId)
        ? message.receiver_id
        : message.sender_id;
    const key = Number(other);
    const current = lastMessageAt.get(key);
    if (!current || message.created_at > current) {
      lastMessageAt.set(key, message.created_at);
    }
  }

  const chatUserIds = [...lastMessageAt.keys()];
  const chatUsers =
    chatUserIds.length === 0
      ? []
      : await prisma.users.findMany({
          where: { id: { in: chatUserIds }, is_admin: false },
        });

  const unreadRows = await prisma.admin_chat_messages.findMany({
    where: { receiver_id: BigInt(userId), is_read: 0 },
    select: { sender_id: true },
  });
  const unreadByUser = new Map<number, number>();
  for (const row of unreadRows) {
    const key = Number(row.sender_id);
    unreadByUser.set(key, (unreadByUser.get(key) ?? 0) + 1);
  }

  const roleNames = await roleNamesByUser(chatUsers.map((item) => item.id));

  const chatList = await Promise.all(
    chatUsers.map(async (chatUser) => {
      const last = lastMessageAt.get(chatUser.id);
      return {
        user_id: chatUser.id,
        user_role: roleNames.get(chatUser.id) ?? "",
        name: ucwords(
          `${chatUser.first_name ?? ""} ${chatUser.last_name ?? ""}`,
        ),
        phone: chatUser.phone,
        profile_image_url: await profilePictureUrl(request, chatUser),
        unread_count: unreadByUser.get(chatUser.id) ?? 0,
        last_message_time: last ? laravelDate(last) : null,
      };
    }),
  );

  chatList.sort((a, b) => {
    if (a.unread_count !== b.unread_count) {
      return b.unread_count - a.unread_count;
    }
    return (b.last_message_time ?? "").localeCompare(
      a.last_message_time ?? "",
    );
  });

  return NextResponse.json(
    { status: true, chat_list: chatList },
    { status: 200 },
  );
}
