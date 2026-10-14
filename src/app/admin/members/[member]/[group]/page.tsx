import { MemberShow } from "@/components/admin/members-show";
import { connection } from "next/server";

export const instant = false;

export default async function MemberShowGroupPage({
  params,
}: {
  params: Promise<{ member: string; group: string }>;
}) {
  // Renders request-time data (session, permission checks, relative timestamps).
  await connection();
  const { member, group } = await params;
  return <MemberShow memberId={member} group={group} />;
}
