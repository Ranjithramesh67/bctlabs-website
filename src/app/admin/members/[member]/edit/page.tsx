import { headers } from "next/headers";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";

import { AccessDenied } from "@/components/admin/access-denied";
import { MembersEditForm } from "@/components/admin/members-form";
import { AdminSection } from "@/components/admin/ui";
import { can } from "@/lib/admin/permissions";
import { mediaUrl } from "@/lib/api-users";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

const USER_MODEL_TYPE = "App\\Models\\User";

export default async function MemberEditPage({
  params,
}: {
  params: Promise<{ member: string }>;
}) {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  const user = await getCurrentUser();
  if (!(await can(user, "manage_staff_member"))) {
    return <AccessDenied />;
  }

  const { member: memberParam } = await params;
  const id = Number(memberParam);
  const member = Number.isInteger(id)
    ? await prisma.users.findUnique({ where: { id } })
    : null;
  if (!member) {
    notFound();
  }

  if (user.roles.includes("staff_member") && member.is_admin) {
    redirect("/admin/members");
  }

  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const media = await prisma.media.findFirst({
    where: {
      model_type: USER_MODEL_TYPE,
      model_id: BigInt(member.id),
      collection_name: "profile",
    },
    orderBy: { id: "asc" },
  });
  // `edit_fields.blade.php`: media > 0 ? image_url : infyom-logo.
  const imageUrl = member.image?.startsWith("uploads/")
    ? `/${member.image}`
    : media
      ? mediaUrl(new Request(`${protocol}://${host}/`), media)
      : "/assets/img/infyom-logo.png";

  return (
    <AdminSection title="EDIT" backHref="/admin/members">
      <div className="card">
        <div className="card-body">
          <MembersEditForm
            member={{
              id: member.id,
              firstName: member.first_name ?? "",
              lastName: member.last_name ?? "",
              email: member.email ?? "",
              phone: member.phone ?? "",
              imageUrl,
            }}
          />
        </div>
      </div>
    </AdminSection>
  );
}
