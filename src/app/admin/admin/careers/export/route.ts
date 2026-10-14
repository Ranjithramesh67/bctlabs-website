import { NextResponse } from "next/server";

import { loadCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

/** Carbon `->format('Y-m-d H:i:s')`. */
function formatSqlDateTime(date: Date | null): string {
  if (!date) {
    return "";
  }
  const pad = (value: number): string => String(value).padStart(2, "0");
  return (
    `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
    `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
  );
}

/** PHP `basename()`. */
function basename(filePath: string): string {
  const parts = filePath.split(/[\\/]/);
  return parts[parts.length - 1] ?? "";
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * CareerApplicationController::export.
 *
 * The original streams an `.xlsx` via `rap2hpoutre/fast-excel`; we emit the
 * same columns as a CSV download.
 */
export async function GET() {
  const user = await loadCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const applications = await prisma.career_applications.findMany();

  const rows: string[] = [
    ["ID", "Name", "Email", "Mobile", "Address", "Resume File", "Applied At"]
      .map(csvCell)
      .join(","),
  ];

  for (const application of applications) {
    rows.push(
      [
        application.id.toString(),
        application.name,
        application.email,
        application.mobile,
        application.address,
        basename(application.resume_path),
        formatSqlDateTime(application.created_at),
      ]
        .map(csvCell)
        .join(","),
    );
  }

  const csv = `${rows.join("\r\n")}\r\n`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=UTF-8",
      "Content-Disposition": 'attachment; filename="career_applications.csv"',
    },
  });
}
