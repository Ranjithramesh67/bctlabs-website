import { notFound } from "next/navigation";
import { connection } from "next/server";

import { updateCategory } from "@/app/admin/category/actions";
import { AdminSection } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { t } from "@/lib/i18n";

export const instant = false;

export default async function CategoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  await getCurrentUser();

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const data = await prisma.categories.findUnique({
    where: { id: numericId },
  });
  if (!data) {
    notFound();
  }

  return (
    <AdminSection
      title={t("ticket_priority.new_ticket_priority")}
      backHref="/admin/get_category"
    >
      <div className="card">
        <div className="card-body">
          <form action={updateCategory}>
            <input type="hidden" name="id" value={id} />
            <div className="row">
              <div className="col-xl-6 col-md-6 mb-4">
                <label className="form-label font-w600">
                  Category Name<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control solid"
                  name="name"
                  defaultValue={data.category_name}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-3">
              Update
            </button>
            <a href="/admin/get_category" className="btn btn-secondary mt-3">
              Back
            </a>
          </form>
        </div>
      </div>
    </AdminSection>
  );
}
