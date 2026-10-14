import { storeEvent } from "@/app/admin/event/actions";
import { connection } from "next/server";
import { BackButton, ContentEditor } from "@/app/admin/event/form-client";
import { AccessDenied } from "@/components/admin/access-denied";
import { AdminSection } from "@/components/admin/ui";
import { can } from "@/lib/admin/permissions";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function EventCreatePage({
  searchParams,
}: {
  searchParams: Promise<{ pages?: string }>;
}) {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  const user = await getCurrentUser();
  if (!(await can(user, "manage_staff_member"))) {
    return <AccessDenied />;
  }

  const { pages: pagesParam } = await searchParams;
  const pages = pagesParam ?? "";

  const categories =
    pages === "products"
      ? await prisma.categories.findMany({
          where: { is_deleted: 0 },
          orderBy: { id: "asc" },
        })
      : [];
  const blogCategories =
    pages === "blog"
      ? await prisma.blog_categories.findMany({
          where: { is_deleted: false },
          orderBy: { id: "asc" },
        })
      : [];

  return (
    <AdminSection title="Create" backHref="/admin/get_category">
      <div className="card">
        <div className="card-body">
          <form action={storeEvent} method="post">
            <div className="row">
              <div className="col-xl-12 col-md-12 mb-4">
                <label className="form-label font-w600">
                  Title<span className="text-danger scale5 ms-2">*</span>
                </label>
                <input
                  type="text"
                  className="form-control solid"
                  name="title"
                  placeholder="Title"
                  required
                />
              </div>

              <div className="col-xl-12 col-md-12 mb-4">
                <label className="form-label font-w600">
                  Main Condent
                  <span className="text-danger scale5 ms-2">*</span>
                </label>
                <textarea
                  className="form-control solid"
                  name="main_condent"
                  placeholder="Enter Main Condent here..."
                  rows={4}
                  required
                ></textarea>
              </div>

              <input type="hidden" name="pages" value={pages} />

              <div className="col-xl-4 col-md-4 mb-4">
                <div className="form-group">
                  <label htmlFor="orderby_no">Order By No</label>
                  <input
                    type="number"
                    className="form-control"
                    name="orderby_no"
                  />
                </div>
              </div>

              {pages === "products" ? (
                <>
                  <div className="col-xl-4 col-md-4 mb-4">
                    <div className="form-group">
                      <label htmlFor="category_id">Category</label>
                      <select name="category_id" className="form-control">
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option
                            value={category.id.toString()}
                            key={category.id}
                          >
                            {category.category_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-xl-4 col-md-4 mb-4">
                    <div className="form-group">
                      <label htmlFor="price">Price</label>
                      <input
                        type="text"
                        className="form-control"
                        step="0.00"
                        name="price"
                      />
                    </div>
                  </div>
                </>
              ) : null}

              {pages === "event" || pages === "news" ? (
                <div className="col-xl-4 col-md-4 mb-4">
                  <div className="form-group">
                    <label htmlFor="date">Date</label>
                    <input type="date" className="form-control" name="date" />
                  </div>
                </div>
              ) : null}

              {pages === "event" ? (
                <div className="col-xl-4 col-md-4 mb-4">
                  <div className="form-group">
                    <label htmlFor="venue">Venue</label>
                    <input type="text" className="form-control" name="venue" />
                  </div>
                </div>
              ) : null}

              {pages === "blog" ? (
                <>
                  <div className="col-xl-4 col-md-4 mb-4">
                    <div className="form-group">
                      <label htmlFor="author_name">Author Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="author_name"
                      />
                    </div>
                  </div>

                  <div className="col-xl-4 col-md-4 mb-4">
                    <div className="form-group">
                      <label htmlFor="category_id">Blog Category</label>
                      <select name="category_id" className="form-control">
                        <option value="">Select Category</option>
                        {blogCategories.map((category) => (
                          <option
                            value={category.id.toString()}
                            key={category.id}
                          >
                            {category.blog_category_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : null}

              <div className="col-xl-3 col-md-3 mb-4">
                <label className="form-label font-w600">
                  Main Image
                  <span className="text-danger scale5 ms-2">*</span>
                </label>
                <input
                  type="file"
                  className="form-control solid"
                  id="image"
                  name="image"
                  placeholder="Main Image"
                  required
                />
              </div>

              <div className="col-xl-3 col-md-3 mb-4">
                <label className="form-label font-w600">
                  Front Image
                  <span className="text-danger scale5 ms-2">*</span>
                </label>
                <input
                  type="file"
                  className="form-control solid"
                  id="image"
                  name="image_1"
                  placeholder="First Image"
                  required
                />
              </div>

              <div className="col-xl-3 col-md-3 mb-4">
                <label className="form-label font-w600">
                  Second Image
                  <span className="text-danger scale5 ms-2">*</span>
                </label>
                <input
                  type="file"
                  className="form-control solid"
                  id="image"
                  name="image_2"
                  placeholder="Second Image"
                />
              </div>

              <div className="col-xl-3 col-md-3 mb-4">
                <label className="form-label font-w600">
                  Three Image
                  <span className="text-danger scale5 ms-2">*</span>
                </label>
                <input
                  type="file"
                  className="form-control solid"
                  id="image"
                  name="image_3"
                  placeholder="Three Image"
                />
              </div>

              <div className="col-xl-3 col-md-3 mb-4">
                <label className="form-label font-w600">
                  Four Image
                  <span className="text-danger scale5 ms-2">*</span>
                </label>
                <input
                  type="file"
                  className="form-control solid"
                  id="image"
                  name="image_4"
                  placeholder="Four Image"
                />
              </div>

              <div className="col-xl-3 col-md-3 mb-4">
                <label className="form-label font-w600">
                  five Image
                  <span className="text-danger scale5 ms-2">*</span>
                </label>
                <input
                  type="file"
                  className="form-control solid"
                  id="image"
                  name="image_5"
                  placeholder="Five Image"
                />
              </div>

              <div className="col-xl-3 col-md-3 mb-4">
                <label className="form-label font-w600">
                  Six Image
                  <span className="text-danger scale5 ms-2">*</span>
                </label>
                <input
                  type="file"
                  className="form-control solid"
                  id="image"
                  name="image_6"
                  placeholder="Six Image"
                />
              </div>

              <ContentEditor
                name="content"
                id="editor"
                className="col-xl-12 col-md-12 mb-4"
              />
            </div>
            <button type="submit" className="btn btn-primary mt-3">
              Save
            </button>
            <BackButton />
          </form>
        </div>
      </div>
    </AdminSection>
  );
}
