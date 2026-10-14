import { notFound } from "next/navigation";
import { connection } from "next/server";

import { updateSubCategory } from "@/app/admin/subcategory/actions";
import { AdminSection } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { t } from "@/lib/i18n";

export const instant = false;

export default async function SubCategoryEditPage({
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

  const [data, categories] = await Promise.all([
    prisma.sub_categories.findUnique({ where: { id: numericId } }),
    prisma.categories.findMany({ where: { is_deleted: 0 } }),
  ]);
  if (!data) {
    notFound();
  }

  return (
    <AdminSection
      title="Edit Sub-Category"
      backHref="/admin/get_subcategory"
    >
      <div className="card">
        <div className="card-body">
          <form
            action={updateSubCategory}
            method="POST"
            encType="multipart/form-data"
          >
            <input type="hidden" name="id" value={id} />
            <div className="row">
              <div className="col-xl-6 col-md-6 mb-4">
                <label className="form-label font-w600">
                  SubCategory Name<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control solid"
                  name="name"
                  defaultValue={data.sub_category_name}
                  required
                />
              </div>
              <div className="col-xl-6 col-md-6 mb-4">
                <label className="form-label font-w600">
                  Select Category
                  <span className="text-danger scale5 ms-2">*</span>
                </label>
                <select
                  className="form-select select2 w-100"
                  name="category_id"
                  required
                  defaultValue={data.category_id.toString()}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option
                      value={category.id.toString()}
                      key={category.id.toString()}
                    >
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-xl-6 col-md-6 mb-4">
                <label className="form-label font-w600">Logo</label>
                <input
                  type="file"
                  className="form-control solid"
                  name="logo"
                />
              </div>

              <div className="col-xl-6 col-md-6 mb-4">
                <label className="form-label font-w600">Image</label>
                <input
                  type="file"
                  className="form-control solid"
                  name="image"
                />
              </div>

              <div className="col-xl-6 col-md-6 mb-4">
                <label className="form-label font-w600">
                  Add URL<span className="text-danger">*</span>
                </label>
                <input
                  type="url"
                  className="form-control solid"
                  name="url"
                  defaultValue={data.sub_category_url ?? ""}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary mt-3">
              Update
            </button>
            <a
              href="/admin/get_subcategory"
              className="btn btn-secondary mt-3"
            >
              {t("common.back")}
            </a>
          </form>
        </div>
      </div>
    </AdminSection>
  );
}
