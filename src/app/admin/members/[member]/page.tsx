import { MemberShow } from "@/components/admin/members-show";
import { connection } from "next/server";

export const instant = false;

export default async function MemberShowPage({
  params,
  searchParams,
}: {
  params: Promise<{ member: string }>;
  searchParams: Promise<{ group?: string }>;
}) {
  // Renders request-time data (session, permission checks, relative timestamps).
  await connection();
  const { member } = await params;
  const { group } = await searchParams;
  return <MemberShow memberId={member} group={group} />;
}
