import { notFound } from "next/navigation";
import { connection } from "next/server";

import { updateBlogCategory } from "@/app/admin/blogcategory/actions";
import { AdminSection } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";

export const instant = false;

export default async function BlogCategoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const data = await prisma.blog_categories.findUnique({
    where: { id: BigInt(numericId) },
  });
  if (!data) {
    notFound();
  }

  return (
    <AdminSection
      title={t("ticket_priority.new_ticket_priority")}
      backHref="/admin/get_blogcategory"
    >
      <div className="card">
        <div className="card-body">
          <form action={updateBlogCategory} method="post">
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
                  defaultValue={data.blog_category_name}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-3">
              Update
            </button>
            <a href="/admin/get_blogcategory" className="btn btn-secondary mt-3">
              Back
            </a>
          </form>
        </div>
      </div>
    </AdminSection>
  );
}
