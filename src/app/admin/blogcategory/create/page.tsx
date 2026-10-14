import { storeBlogCategory } from "@/app/admin/blogcategory/actions";
import { AdminSection } from "@/components/admin/ui";
import { t } from "@/lib/i18n";

export const instant = false;

export default function BlogCategoryCreatePage() {
  return (
    <AdminSection
      title={t("ticket_priority.new_ticket_priority")}
      backHref="/admin/get_blogcategory"
    >
      <div className="card">
        <div className="card-body">
          <form action={storeBlogCategory}>
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
            <a href="/admin/get_blogcategory" className="btn btn-secondary mt-3">
              Back
            </a>
          </form>
        </div>
      </div>
    </AdminSection>
  );
}
