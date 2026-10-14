import { storeSubCategory } from "@/app/admin/subcategory/actions";
import { connection } from "next/server";
import { AdminSection } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { t } from "@/lib/i18n";

export const instant = false;

export default async function SubCategoryCreatePage() {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  await getCurrentUser();

  const categories = await prisma.categories.findMany({
    where: { is_deleted: 0 },
  });

  return (
    <AdminSection
      title="Add Sub-Category"
      backHref="/admin/get_subcategory"
    >
      <div className="card">
        <div className="card-body">
          <form
            id="updateDriverForm"
            action={storeSubCategory}
            method="POST"
            encType="multipart/form-data"
          >
            <div className="row">
              <div className="col-xl-6 col-md-6 mb-4">
                <label className="form-label font-w600">
                  Sub-Category Name
                  <span className="text-danger scale5 ms-2">*</span>
                </label>
                <input
                  type="text"
                  className="form-control solid"
                  name="name"
                  placeholder="Category Name"
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
                  defaultValue=""
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
                <label className="form-label font-w600">
                  Logo
                  <span className="text-danger scale5 ms-2">*</span>
                </label>
                <input
                  type="file"
                  className="form-control solid"
                  id="logo"
                  name="logo"
                  placeholder="Add Logo"
                  required
                />
              </div>

              <div className="col-xl-6 col-md-6 mb-4">
                <label className="form-label font-w600">
                  Image
                  <span className="text-danger scale5 ms-2">*</span>
                </label>
                <input
                  type="file"
                  className="form-control solid"
                  id="image"
                  name="image"
                  placeholder="Add Image"
                  required
                />
              </div>

              <div className="col-xl-6 col-md-6 mb-4">
                <label className="form-label font-w600">
                  Add URL
                  <span className="text-danger scale5 ms-2">*</span>
                </label>
                <input
                  type="url"
                  className="form-control solid"
                  name="url"
                  placeholder="Add URL"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary mt-3">
              Save
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
