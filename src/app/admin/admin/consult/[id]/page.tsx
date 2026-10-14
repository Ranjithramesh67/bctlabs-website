import { notFound } from "next/navigation";
import { connection } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

function toDate(value: Date | string | null): Date | null {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Carbon `->format('d M Y')`. */
function formatDate(value: Date | string | null): string {
  const date = toDate(value);
  if (!date) {
    return "";
  }
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${day} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** Carbon `->format('h:i A')`. */
function formatTime(value: Date | string | null): string {
  if (!value) {
    return "";
  }
  let hours: number;
  let minutes: number;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return "";
    }
    hours = value.getUTCHours();
    minutes = value.getUTCMinutes();
  } else {
    const match = /^(\d{1,2}):(\d{2})/.exec(value);
    if (!match) {
      return "";
    }
    hours = Number(match[1]);
    minutes = Number(match[2]);
  }
  const meridiem = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(displayHour).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )} ${meridiem}`;
}

/** Carbon `->format('d M Y, h:i A')`. */
function formatDateTime(date: Date | null): string {
  if (!date) {
    return "";
  }
  const day = String(date.getUTCDate()).padStart(2, "0");
  let hours = date.getUTCHours();
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours %= 12;
  if (hours === 0) {
    hours = 12;
  }
  const hh = String(hours).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${day} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}, ${hh}:${mm} ${meridiem}`;
}

export default async function ConsultShowPage({
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

  const application = await prisma.consultations.findUnique({
    where: { id: numericId },
  });
  if (!application) {
    notFound();
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title">Application Details</h3>
              <div className="card-tools">
                <a href="/admin/admin/consult" className="btn btn-light btn-sm">
                  <i className="fas fa-arrow-left"></i> Back to List
                </a>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h4>Information</h4>
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
                        <th>Designation:</th>
                        <td>{application.designation}</td>
                      </tr>
                      <tr>
                        <th>School | Institution:</th>
                        <td>{application.school}</td>
                      </tr>
                      <tr>
                        <th>Student Strength:</th>
                        <td>{application.student_strength}</td>
                      </tr>
                      <tr>
                        <th>City &amp; State:</th>
                        <td>{application.city}</td>
                      </tr>
                      <tr>
                        <th>Applied On:</th>
                        <td>{formatDateTime(application.created_at)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <br />
                  <br />
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th style={{ width: "30%" }}>
                          Type of Lab Intrested in:
                        </th>
                        <td>{application.lab_type}</td>
                      </tr>
                      <tr>
                        <th>Preferred Date &amp; Time:</th>
                        <td>
                          {formatDate(application.preferred_date)},{" "}
                          {formatTime(application.preferred_time)}
                        </td>
                      </tr>
                      <tr>
                        <th>Preferred Mode:</th>
                        <td>{application.preferred_mode}</td>
                      </tr>
                      <tr>
                        <th>How did you know:</th>
                        <td>{application.heard_about}</td>
                      </tr>
                    </tbody>
                  </table>
                  <br />
                  <h4>Requirements or Queries</h4>
                  <div className="border p-3 bg-light">
                    {application.questions}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
