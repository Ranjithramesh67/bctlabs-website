import { AccessDenied } from "@/components/admin/access-denied";
import { connection } from "next/server";
import {
  MembersCreateForm,
  type PermissionGroup,
} from "@/components/admin/members-form";
import { AdminSection } from "@/components/admin/ui";
import { can } from "@/lib/admin/permissions";
import { getCurrentUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function MemberCreatePage() {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  const user = await getCurrentUser();
  if (!(await can(user, "manage_staff_member"))) {
    return <AccessDenied />;
  }

  const [departments, permissions] = await Promise.all([
    prisma.departments.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.permissions.findMany({
      where: { type: { not: "Contacts" } },
      orderBy: { id: "asc" },
    }),
  ]);

  const grouped = new Map<string, PermissionGroup>();
  for (const permission of permissions) {
    const type = permission.type ?? "";
    const group = grouped.get(type) ?? { type, permissions: [] };
    group.permissions.push({
      id: Number(permission.id),
      display_name: permission.display_name ?? "",
    });
    grouped.set(type, group);
  }

  return (
    <AdminSection title={t("member.new_member")} backHref="/admin/members">
      <div className="card">
        <div className="card-body">
          <MembersCreateForm
            departments={departments}
            permissionGroups={[...grouped.values()]}
          />
        </div>
      </div>
    </AdminSection>
  );
}
