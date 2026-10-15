import { storeDashboardImage } from "@/app/admin/dashboard_image/actions";
import { connection } from "next/server";
import { AdminSection } from "@/components/admin/ui";
import { getCurrentUser } from "@/lib/auth";

export const instant = false;

// Keep the image preview bounded instead of rendering at natural size and make
// the fields/buttons behave on phones (see subcategory/create).
const DASHBOARD_IMG_STYLE = `.dashimg .thumbnail-preview{height:70px;max-width:100%;object-fit:contain}@media (max-width:575.98px){.dashimg .form-control{width:100%}.dashimg .btn{min-height:40px}}`;

// Guarded delegate listener so the live preview also survives soft navigation.
const DASHBOARD_IMG_PREVIEW_SCRIPT = `(function () {
  if (window.__dashboardImgPreviewBound) return;
  window.__dashboardImgPreviewBound = true;
  document.addEventListener("change", function (event) {
    var target = event.target;
    if (!target || target.tagName !== "INPUT" || target.type !== "file") return;
    if (target.id !== "image") return;
    var img = document.getElementById("dashimg-preview");
    if (!img) return;
    var file = target.files && target.files[0];
    if (!file) return;
    img.src = URL.createObjectURL(file);
    var wrap = document.getElementById("dashimg-preview-wrap");
    if (wrap) wrap.hidden = false;
  });
})();`;

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
      <style dangerouslySetInnerHTML={{ __html: DASHBOARD_IMG_STYLE }} />
      <div className="card">
        <div className="card-body">
          <form
            className="dashimg"
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
                  id="image"
                  name="image"
                />
                <div id="dashimg-preview-wrap" className="mt-2" hidden>
                  <img
                    id="dashimg-preview"
                    className="img-thumbnail thumbnail-preview"
                    alt=""
                  />
                </div>
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
            <script
              dangerouslySetInnerHTML={{ __html: DASHBOARD_IMG_PREVIEW_SCRIPT }}
            />
          </form>
        </div>
      </div>
    </AdminSection>
  );
}
