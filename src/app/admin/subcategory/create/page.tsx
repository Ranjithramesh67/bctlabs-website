import { storeSubCategory } from "@/app/admin/subcategory/actions";
import { connection } from "next/server";
import { AdminSection } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { t } from "@/lib/i18n";

export const instant = false;

// The vendored Stisla/Bootstrap 4 theme has no `.form-select`/`.select2` rules
// and select2 is never initialised, so the category <select> would render as a
// bare 23px UA control next to 42px `.form-control` inputs. This scoped style
// makes it match the theme fields, and keeps the thumbnail previews bounded.
const SUBFIX_STYLE = `.subfix select.form-select{display:block;width:100%;height:42px;padding:10px 15px;font-size:14px;line-height:1.5;color:#495057;background-color:#fdfdff;border:1px solid #e4e6fc;border-radius:4px}.subfix select.form-select:focus{border-color:#80bdff;outline:0;box-shadow:0 0 0 .2rem rgba(0,123,255,.25)}.subfix .thumbnail-preview{height:70px;max-width:100%;object-fit:contain}@media (max-width:575.98px){.subfix .form-control,.subfix select.form-select{width:100%}.subfix .btn{min-height:40px}}`;

// Guarded delegate listener so the live preview also survives soft navigation
// (it is attached once per full page load and matches inputs by id).
const SUBFIX_PREVIEW_SCRIPT = `(function () {
  if (window.__subfixPreviewBound) return;
  window.__subfixPreviewBound = true;
  var imgMap = { logo: "subfix-logo-preview", image: "subfix-image-preview" };
  var wrapMap = { logo: "subfix-logo-preview-wrap", image: "subfix-image-preview-wrap" };
  document.addEventListener("change", function (event) {
    var target = event.target;
    if (!target || target.tagName !== "INPUT" || target.type !== "file") return;
    var img = document.getElementById(imgMap[target.id]);
    if (!img) return;
    var file = target.files && target.files[0];
    if (!file) return;
    img.src = URL.createObjectURL(file);
    var wrap = document.getElementById(wrapMap[target.id]);
    if (wrap) wrap.hidden = false;
  });
})();`;

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
      <style dangerouslySetInnerHTML={{ __html: SUBFIX_STYLE }} />
      <div className="card">
        <div className="card-body">
          <form
            id="updateDriverForm"
            className="subfix"
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
                <div
                  id="subfix-logo-preview-wrap"
                  className="mt-2"
                  hidden
                >
                  <img
                    id="subfix-logo-preview"
                    className="img-thumbnail thumbnail-preview"
                    alt=""
                  />
                </div>
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
                <div
                  id="subfix-image-preview-wrap"
                  className="mt-2"
                  hidden
                >
                  <img
                    id="subfix-image-preview"
                    className="img-thumbnail thumbnail-preview"
                    alt=""
                  />
                </div>
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

            <button type="submit" className="btn btn-primary mt-3 mr-2">
              Save
            </button>
            <a
              href="/admin/get_subcategory"
              className="btn btn-secondary mt-3"
            >
              {t("common.back")}
            </a>
            <script
              dangerouslySetInnerHTML={{ __html: SUBFIX_PREVIEW_SCRIPT }}
            />
          </form>
        </div>
      </div>
    </AdminSection>
  );
}
