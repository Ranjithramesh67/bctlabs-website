import "server-only";

import { prisma } from "./prisma";
import { toNumber } from "./format";

export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: Date | null;
};

type Row = {
  id: bigint;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  created_at: Date | null;
};

export async function getContactMessages(limit = 100): Promise<ContactMessage[]> {
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT id, name, email, phone, subject, message, created_at
    FROM bctlabs_contact_messages
    ORDER BY created_at DESC
    LIMIT ${Math.min(500, Math.max(1, limit))}
  `;
  return rows.map((r) => ({
    id: toNumber(r.id),
    name: r.name,
    email: r.email,
    phone: r.phone ?? "",
    subject: r.subject ?? "",
    message: r.message,
    createdAt: r.created_at,
  }));
}

export async function getContactMessageCount(): Promise<number> {
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) AS count FROM bctlabs_contact_messages
  `;
  return toNumber(rows[0]?.count);
}
