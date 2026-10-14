import { notFound } from "next/navigation";
import { connection } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { deleteCareerApplication } from "../actions";

export const instant = false;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Carbon `->format('d M Y, h:i A')`. */
function formatDateTime(date: Date | null): string {
  if (!date) {
    return "";
  }
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  let hours = date.getUTCHours();
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours %= 12;
  if (hours === 0) {
    hours = 12;
  }
  const hh = String(hours).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month} ${year}, ${hh}:${mm} ${meridiem}`;
}

/** PHP `pathinfo($path, PATHINFO_EXTENSION)`. */
function pathinfoExtension(filePath: string): string {
  const lastDot = filePath.lastIndexOf(".");
  if (lastDot === -1 || lastDot === filePath.length - 1) {
    return "";
  }
  return filePath.slice(lastDot + 1);
}

export default async function CareerApplicationShowPage({
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

  const application = await prisma.career_applications.findUnique({
    where: { id: BigInt(numericId) },
  });
  if (!application) {
    notFound();
  }

  const extension = pathinfoExtension(application.resume_path).toUpperCase();

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title">Application Details</h3>
              <div className="card-tools text-right">
                <a
                  href="/admin/admin/careers"
                  className="btn btn-light btn-sm"
                >
                  <i className="fas fa-arrow-left"></i> Back to List
                </a>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h4>Personal Information</h4>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th style={{ width: "30%" }}>Name:</th>
                        <td>{application.name}</td>
                      </tr>
                      <tr>
                        <th>Email:</th>
                        <td>{application.email}</td>
                      </tr>
                      <tr>
                        <th>Mobile:</th>
                        <td>{application.mobile}</td>
                      </tr>
                      <tr>
                        <th>Qualification:</th>
                        <td>{application.qualification}</td>
                      </tr>
                      <tr>
                        <th>Date Of Birth:</th>
                        <td>{application.dob}</td>
                      </tr>
                      <tr>
                        <th>Gender:</th>
                        <td>{application.gender}</td>
                      </tr>
                      <tr>
                        <th>Whatsapp Mobile:</th>
                        <td>{application.whatsappMobile}</td>
                      </tr>
                      <tr>
                        <th>Year of Experience :</th>
                        <td>{application.yearofexperience}</td>
                      </tr>
                      <tr>
                        <th>Applied On:</th>
                        <td>{formatDateTime(application.created_at)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h4>Address</h4>
                  <div className="border p-3 bg-light">
                    {application.address}
                  </div>

                  <h4 className="mt-4">Resume</h4>
                  <div className="border p-3 bg-light">
                    <a
                      href={`/admin/admin/careers/${application.id}/download`}
                      target="_blank"
                      className="btn btn-primary"
                    >
                      <i className="fas fa-download"></i> Download Resume
                    </a>
                    <span className="ml-3">{extension} File</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <form action={deleteCareerApplication}>
                  <input
                    type="hidden"
                    name="id"
                    value={application.id.toString()}
                  />
                  <button type="submit" className="btn btn-danger">
                    <i className="fas fa-trash"></i> Delete Application
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
