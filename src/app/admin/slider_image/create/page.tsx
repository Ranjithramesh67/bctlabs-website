import { storeSlider } from "@/app/admin/slider_image/actions";
import { connection } from "next/server";
import { AdminSection } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const instant = false;

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
      <div className="card">
        <div className="card-body">
          <form
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
                  name="image"
                />
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
          </form>
        </div>
      </div>
    </AdminSection>
  );
}
