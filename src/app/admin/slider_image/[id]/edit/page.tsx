import { notFound } from "next/navigation";
import { connection } from "next/server";

import { updateSlider } from "@/app/admin/slider_image/actions";
import { AdminSection } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const instant = false;

export default async function SliderImageEditPage({
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

  const data = await prisma.sliders.findUnique({ where: { id: numericId } });
  if (!data) {
    notFound();
  }

  const states = await prisma.states.findMany({
    where: { country_id: 101 },
  });

  return (
    <AdminSection
      title="Edit Slider Image"
      backHref="/admin/slider_image"
      backLabel="Slider image"
    >
      <div className="card">
        <div className="card-body">
          <form
            action={updateSlider}
            encType="multipart/form-data"
          >
            <input type="hidden" name="id" value={id} />
            <div className="row">
              <div className="col-xl-4 col-md-4 mb-4">
                <label className="form-label font-w600">
                  Slider Image Title<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control solid"
                  name="title"
                  defaultValue={data.slider_title ?? ""}
                  required
                />
              </div>

              <div className="col-xl-4 col-md-4 mb-4">
                <label className="form-label font-w600">Image</label>
                <input
                  type="file"
                  className="form-control solid"
                  name="image"
                />
              </div>

              <div className="col-xl-4 col-md-4 mb-4">
                <label htmlFor="state">State:</label>
                <select
                  name="state_id"
                  id="state"
                  className="form-control select2"
                  defaultValue={data.state_id !== null ? data.state_id : ""}
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
                  defaultValue={data.start_date ?? ""}
                />
              </div>

              <div className="col-xl-6 col-md-6 mb-4">
                <label className="form-label font-w600">End Date</label>
                <input
                  type="date"
                  className="form-control solid"
                  name="end_date"
                  defaultValue={data.end_date ?? ""}
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
                  defaultValue={data.slider_description ?? ""}
                ></textarea>
              </div>
            </div>

            <button type="submit" className="btn btn-primary mt-3">
              Update
            </button>
            &nbsp;&nbsp;
            <a
              href="/admin/slider_image"
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
