import { storeSlider } from "@/app/admin/slider_image/actions";
import { connection } from "next/server";
import { AdminSection } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const instant = false;

// The theme is Bootstrap 4.6 with select2 never initialised, so make the state
// <select> match the 42px `.form-control` fields and keep the image preview
// bounded instead of rendering at natural size (see subcategory/create).
const SLIDER_IMG_STYLE = `.sliderimg select.form-control{display:block;width:100%;height:42px;padding:10px 15px;font-size:14px;line-height:1.5;color:#495057;background-color:#fdfdff;border:1px solid #e4e6fc;border-radius:4px}.sliderimg select.form-control:focus{border-color:#80bdff;outline:0;box-shadow:0 0 0 .2rem rgba(0,123,255,.25)}.sliderimg .thumbnail-preview{height:70px;max-width:100%;object-fit:contain}@media (max-width:575.98px){.sliderimg .form-control,.sliderimg select.form-control{width:100%}.sliderimg .btn{min-height:40px}}`;

// Guarded delegate listener so the live preview also survives soft navigation.
const SLIDER_IMG_PREVIEW_SCRIPT = `(function () {
  if (window.__sliderImgPreviewBound) return;
  window.__sliderImgPreviewBound = true;
  document.addEventListener("change", function (event) {
    var target = event.target;
    if (!target || target.tagName !== "INPUT" || target.type !== "file") return;
    if (target.id !== "image") return;
    var img = document.getElementById("sliderimg-preview");
    if (!img) return;
    var file = target.files && target.files[0];
    if (!file) return;
    img.src = URL.createObjectURL(file);
    var wrap = document.getElementById("sliderimg-preview-wrap");
    if (wrap) wrap.hidden = false;
  });
})();`;

export default async function SliderImageCreatePage() {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  await getCurrentUser();

  const states = await prisma.states.findMany({
    where: { country_id: 101 },
  });

  return (
    <AdminSection
      title="Add Slider image"
      backHref="/admin/slider_image"
      backLabel="Slider image"
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDER_IMG_STYLE }} />
      <div className="card">
        <div className="card-body">
          <form
            className="sliderimg"
            action={storeSlider}
            encType="multipart/form-data"
          >
            <div className="row">
              <div className="col-xl-4 col-md-4 mb-4">
                <label className="form-label font-w600">
                  Slider Image Title<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control solid"
                  name="title"
                  required
                />
              </div>

              <div className="col-xl-4 col-md-4 mb-4">
                <label className="form-label font-w600">Image</label>
                <input
                  type="file"
                  className="form-control solid"
                  id="image"
                  name="image"
                />
                <div id="sliderimg-preview-wrap" className="mt-2" hidden>
                  <img
                    id="sliderimg-preview"
                    className="img-thumbnail thumbnail-preview"
                    alt=""
                  />
                </div>
              </div>

              <div className="col-xl-4 col-md-4 mb-4">
                <label htmlFor="state">State:</label>
                <select
                  name="state_id"
                  id="state"
                  className="form-control select2"
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option value={state.id} key={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-xl-6 col-md-6 mb-4">
                <label className="form-label font-w600">
                  Start Date<span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control solid"
                  name="start_date"
                  required
                />
              </div>

              <div className="col-xl-6 col-md-6 mb-4">
                <label className="form-label font-w600">End Date</label>
                <input
                  type="date"
                  className="form-control solid"
                  name="end_date"
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
              href="/admin/slider_image"
              className="btn btn-secondary mt-3"
            >
              Back
            </a>
            <script
              dangerouslySetInnerHTML={{ __html: SLIDER_IMG_PREVIEW_SCRIPT }}
            />
          </form>
        </div>
      </div>
    </AdminSection>
  );
}
