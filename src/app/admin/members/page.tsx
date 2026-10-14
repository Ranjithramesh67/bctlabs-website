import { headers } from "next/headers";
import { connection } from "next/server";

import { AccessDenied } from "@/components/admin/access-denied";
import { MembersIndex, type MemberRow } from "@/components/admin/members-index";
import { can } from "@/lib/admin/permissions";
import { profilePictureUrl } from "@/lib/api-users";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const instant = false;

/** Livewire `Members::$paginate`. */
const PER_PAGE = 12;
const USER_MODEL_TYPE = "App\\Models\\User";

export default async function MembersIndexPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    is_enable?: string;
    fromDate?: string;
    toDate?: string;
  }>;
}) {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  const user = await getCurrentUser();
  if (!(await can(user, "manage_staff_member"))) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = (params.search ?? "").trim();
  const status = params.is_enable ?? "";
  const fromDate = params.fromDate ?? "";
  const toDate = params.toDate ?? "";

  const where: Prisma.usersWhereInput = {
    owner_id: null,
    owner_type: null,
    is_admin: false,
  };
  if (status === "1") {
    where.is_enable = true;
  } else if (status === "0") {
    where.is_enable = false;
  }
  if (fromDate && toDate) {
    const start = new Date(`${fromDate}T00:00:00.000Z`);
    const end = new Date(`${toDate}T23:59:59.999Z`);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      where.created_at = { gte: start, lte: end };
    }
  }
  if (search) {
    const terms = search.toLowerCase();
    const roles = await prisma.roles.findMany({
      where: { name: { contains: terms } },
      select: { id: true },
    });
    const assignments =
      roles.length === 0
        ? []
        : await prisma.model_has_roles.findMany({
            where: {
              role_id: { in: roles.map((role) => role.id) },
              model_type: USER_MODEL_TYPE,
            },
            select: { model_id: true },
          });
    where.OR = [
      { first_name: { contains: terms } },
      { email: { contains: terms } },
      { phone: { contains: terms } },
      { css_no: { contains: terms } },
      { branch: { contains: terms } },
      ...(assignments.length > 0
        ? [{ id: { in: assignments.map((row) => Number(row.model_id)) } }]
        : []),
    ];
  }

  const [members, total, canManageEdit, canManageDelete, canManageStatus] =
    await Promise.all([
      prisma.users.findMany({
        where,
        orderBy: { is_enable: "desc" },
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
      }),
      prisma.users.count({ where }),
      can(user, "manage_edit_user"),
      can(user, "manage_delete_user"),
      can(user, "manage_user_status"),
    ]);

  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const request = new Request(`${protocol}://${host}/`);

  const rows: MemberRow[] = await Promise.all(
    members.map(async (member) => ({
      id: member.id,
      firstName: member.first_name,
      email: member.email,
      phone: member.phone,
      imageUrl:
        member.image && member.image.startsWith("uploads/")
          ? `/${member.image}`
          : await profilePictureUrl(request, member),
      isEnable: member.is_enable,
      isBlocked: member.isBlocked,
    })),
  );

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <MembersIndex
      members={rows}
      currentUserId={user.id}
      canManageEdit={canManageEdit}
      canManageDelete={canManageDelete}
      canManageStatus={canManageStatus}
      filters={{ search, status, fromDate, toDate }}
      pagination={{
        currentPage: page,
        lastPage,
        perPage: PER_PAGE,
        total,
      }}
    />
  );
}
