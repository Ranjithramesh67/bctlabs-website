import { notFound } from "next/navigation";
import { connection } from "next/server";

import { updateEvent } from "@/app/admin/event/actions";
import {
  BackButton,
  ContentEditor,
  ImagePreviewDelete,
} from "@/app/admin/event/form-client";
import { AccessDenied } from "@/components/admin/access-denied";
import { AdminSection } from "@/components/admin/ui";
import { can } from "@/lib/admin/permissions";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function EventEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ event: string }>;
  searchParams: Promise<{ pages?: string }>;
}) {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  const user = await getCurrentUser();
  if (!(await can(user, "manage_staff_member"))) {
    return <AccessDenied />;
  }

  const { event: eventParam } = await params;
  const numericId = Number(eventParam);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const data = await prisma.events.findUnique({
    where: { id: BigInt(numericId) },
  });
  if (!data) {
    notFound();
  }

  const { pages: pagesParam } = await searchParams;
  const pages = pagesParam ?? data.type;
  const id = data.id.toString();

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
    <AdminSection title="Edit" backHref="/admin/event/index">
      <div className="card">
        <div className="card-body">
          <form action={updateEvent} method="post">
            <input type="hidden" name="id" value={id} />
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
                  defaultValue={data.title}
                  required
                />
              </div>

              <div className="col-xl-12 col-md-12 mb-4">
                <label className="form-label font-w600">
                  Main Content
                  <span className="text-danger scale5 ms-2">*</span>
                </label>
                <textarea
                  className="form-control solid"
                  name="main_condent"
                  placeholder="Enter Main Content here..."
                  rows={4}
                  defaultValue={data.main_condent ?? ""}
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
                    defaultValue={data.orderby_no ?? ""}
                  />
                </div>
              </div>

              {pages === "products" ? (
                <>
                  <div className="col-xl-4 col-md-4 mb-4">
                    <div className="form-group">
                      <label htmlFor="category_id">Category</label>
                      <select
                        name="category_id"
                        className="form-control"
                        defaultValue={data.category_id?.toString() ?? ""}
                      >
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
                        name="price"
                        defaultValue={data.price.toString()}
                      />
                    </div>
                  </div>
                </>
              ) : null}

              {pages === "event" || pages === "news" ? (
                <div className="col-xl-4 col-md-4 mb-4">
                  <div className="form-group">
                    <label htmlFor="date">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="date"
                      defaultValue={data.date ?? ""}
                    />
                  </div>
                </div>
              ) : null}

              {pages === "event" ? (
                <div className="col-xl-4 col-md-4 mb-4">
                  <div className="form-group">
                    <label htmlFor="venue">Venue</label>
                    <input
                      type="text"
                      className="form-control"
                      name="venue"
                      defaultValue={data.venue ?? ""}
                    />
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
                        defaultValue={data.author_name ?? ""}
                      />
                    </div>
                  </div>

                  <div className="col-xl-4 col-md-4 mb-4">
                    <div className="form-group">
                      <label htmlFor="category_id">Blog Category</label>
                      <select
                        name="category_id"
                        className="form-control"
                        defaultValue={data.category_id?.toString() ?? ""}
                      >
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
                <label className="form-label font-w600">Main Image</label>
                <input
                  type="file"
                  className="form-control solid"
                  name="main_image"
                />
                <div className="mt-2 image-preview-container">
                  <img
                    src={`/${data.main_image}`}
                    className="img-thumbnail"
                    width={100}
                    alt=""
                  />
                </div>
              </div>

              <div className="col-xl-3 col-md-3 mb-4">
                <label className="form-label font-w600">Front Image</label>
                <input
                  type="file"
                  className="form-control solid"
                  name="start_image"
                />
                <div className="mt-2 image-preview-container">
                  <img
                    src={`/${data.start_image}`}
                    className="img-thumbnail"
                    width={100}
                    alt=""
                  />
                </div>
              </div>

              <div className="col-xl-3 col-md-3 mb-4">
                <label className="form-label font-w600">Second Image</label>
                <input
                  type="file"
                  className="form-control solid"
                  name="middle_image"
                />
                {data.middle_image ? (
                  <ImagePreviewDelete
                    id={id}
                    field="middle_image"
                    src={`/${data.middle_image}`}
                  />
                ) : null}
              </div>

              <div className="col-xl-3 col-md-3 mb-4">
                <label className="form-label font-w600">Third Image</label>
                <input
                  type="file"
                  className="form-control solid"
                  name="end_image"
                />
                {data.end_image ? (
                  <ImagePreviewDelete
                    id={id}
                    field="end_image"
                    src={`/${data.end_image}`}
                  />
                ) : null}
              </div>

              <div className="col-xl-3 col-md-3 mb-4">
                <label className="form-label font-w600">Fourth Image</label>
                <input
                  type="file"
                  className="form-control solid"
                  name="image_4"
                />
                {data.image_4 ? (
                  <ImagePreviewDelete
                    id={id}
                    field="image_4"
                    src={`/${data.image_4}`}
                  />
                ) : null}
              </div>

              <div className="col-xl-3 col-md-3 mb-4">
                <label className="form-label font-w600">Fifth Image</label>
                <input
                  type="file"
                  className="form-control solid"
                  name="image_5"
                />
                {data.image_5 ? (
                  <ImagePreviewDelete
                    id={id}
                    field="image_5"
                    src={`/${data.image_5}`}
                  />
                ) : null}
              </div>

              <div className="col-xl-3 col-md-3 mb-4">
                <label className="form-label font-w600">Sixth Image</label>
                <input
                  type="file"
                  className="form-control solid"
                  name="image_6"
                />
                {data.image_6 ? (
                  <ImagePreviewDelete
                    id={id}
                    field="image_6"
                    src={`/${data.image_6}`}
                  />
                ) : null}
              </div>

              <ContentEditor
                name="content"
                id="editor"
                className="form-control"
                defaultValue={data.content ?? ""}
              />
            </div>
            <button type="submit" className="btn btn-primary mt-3">
              Update
            </button>
            <BackButton />
          </form>
        </div>
      </div>
      <style>{`
        .image-preview-container {
          position: relative;
          display: inline-block;
        }
        .delete-image {
          position: absolute;
          top: 0;
          right: 0;
          transform: translate(50%, -50%);
        }
      `}</style>
    </AdminSection>
  );
}
