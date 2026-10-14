import { USER_MODEL_TYPE } from "@/lib/api-token";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { ChatClient } from "./chat-client";

export const instant = false;

/** Laravel `UserController`/`ChatController::getChatPage` -> `User::find($id)`. */
export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ user_id?: string }>;
}) {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  await getCurrentUser();

  const { user_id } = await searchParams;
  const numericId = Number(user_id);

  let user: {
    id: number;
    firstName: string;
    phone: string;
    roleNames: string;
  } | null = null;

  if (Number.isInteger(numericId) && numericId > 0) {
    const found = await prisma.users.findUnique({
      where: { id: numericId },
    });
    if (found) {
      const assignments = await prisma.model_has_roles.findMany({
        where: { model_id: BigInt(found.id), model_type: USER_MODEL_TYPE },
      });
      const roleIds = assignments.map((row) => row.role_id);
      const roles =
        roleIds.length > 0
          ? await prisma.roles.findMany({
              where: { id: { in: roleIds } },
              orderBy: { id: "asc" },
            })
          : [];
      user = {
        id: found.id,
        firstName: found.first_name ?? "",
        phone: found.phone ?? "",
        roleNames: roles.map((role) => role.display_name ?? "").join(","),
      };
    }
  }

  return <ChatClient user={user} />;
}
