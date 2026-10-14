import { storeDashboardImage } from "@/app/admin/dashboard_image/actions";
import { connection } from "next/server";
import { AdminSection } from "@/components/admin/ui";
import { getCurrentUser } from "@/lib/auth";

export const instant = false;

export default async function DashboardImageCreatePage() {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  await getCurrentUser();

  return (
    <AdminSection
      title="Add Dashboard image"
      backHref="/admin/dashboard_image"
      backLabel="Dashboard image"
    >
      <div className="card">
        <div className="card-body">
          <form
            action={storeDashboardImage}
            encType="multipart/form-data"
          >
            <div className="row">
              <div className="col-xl-6 col-md-6 mb-4">
                <label className="form-label font-w600">
                  Dashboard Image Title<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control solid"
                  name="title"
                  required
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

              <div className="col-xl-12 col-md-12 mb-4">
                <label className="form-label font-w600">
                  Description<span className="text-danger">*</span>
                </label>
                <textarea
                  name="description"
                  id="description"
                  className="form-control solid"
                  style={{ height: 150, resize: "none" }}
                ></textarea>
              </div>
            </div>

            <button type="submit" className="btn btn-primary mt-3">
              Save
            </button>
            &nbsp;&nbsp;
            <a
              href="/admin/dashboard_image"
              className="btn btn-secondary mt-3"
            >
              Back
            </a>
          </form>
        </div>
      </div>
    </AdminSection>
  );
}
