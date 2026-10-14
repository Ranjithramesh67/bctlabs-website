import { storeCategory } from "@/app/admin/category/actions";
import { connection } from "next/server";
import { AdminSection } from "@/components/admin/ui";
import { getCurrentUser } from "@/lib/auth";
import { t } from "@/lib/i18n";

export const instant = false;

export default async function CategoryCreatePage() {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  await getCurrentUser();

  return (
    <AdminSection
      title={t("ticket_priority.new_ticket_priority")}
      backHref="/admin/get_category"
    >
      <div className="card">
        <div className="card-body">
          <form action={storeCategory}>
            <div className="row">
              <div className="col-xl-6 col-md-6 mb-4">
                <label className="form-label font-w600">
                  Category Name
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
            </div>
            <button type="submit" className="btn btn-primary mt-3">
              Save
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
