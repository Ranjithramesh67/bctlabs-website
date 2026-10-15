import { notFound } from "next/navigation";
import { connection } from "next/server";

import { updateDashboardImage } from "@/app/admin/dashboard_image/actions";
import { AdminSection } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const instant = false;

// Keep the stored/selected image preview bounded (see dashboard_image/create).
const DASHBOARD_IMG_STYLE = `.dashimg .thumbnail-preview{height:70px;max-width:100%;object-fit:contain}@media (max-width:575.98px){.dashimg .form-control{width:100%}.dashimg .btn{min-height:40px}}`;

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

export default async function DashboardImageEditPage({
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

  const data = await prisma.dashboard_slider.findUnique({
    where: { id: BigInt(numericId) },
  });
  if (!data) {
    notFound();
  }

  return (
    <AdminSection
      title="Edit Dashboard Image"
      backHref="/admin/dashboard_image"
      backLabel="Dashboard image"
    >
      <style dangerouslySetInnerHTML={{ __html: DASHBOARD_IMG_STYLE }} />
      <div className="card">
        <div className="card-body">
          <form
            className="dashimg"
            action={updateDashboardImage}
            encType="multipart/form-data"
          >
            <input type="hidden" name="id" value={id} />
            <div className="row">
              <div className="col-xl-6 col-md-6 mb-4">
                <label className="form-label font-w600">
                  Dashboard Image Title<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control solid"
                  name="title"
                  defaultValue={data.title}
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
                <div
                  id="dashimg-preview-wrap"
                  className="mt-2"
                  hidden={!data.image}
                >
                  <img
                    id="dashimg-preview"
                    className="img-thumbnail thumbnail-preview"
                    src={data.image ? `/${data.image}` : undefined}
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
                  defaultValue={data.description ?? ""}
                ></textarea>
              </div>
            </div>

            <button type="submit" className="btn btn-primary mt-3">
              Update
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
