import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin-login-form";
import { Card } from "@/components/ui";
import { getAdminSession, isStaffUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin sign in" };

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session.userId && (await isStaffUser(session.userId))) {
    redirect("/admin");
  }

  return (
    <Card className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin sign in</h1>
      <p className="mt-1.5 text-sm text-slate-500">
        Sign in with a store staff account to access the admin area.
      </p>
      <div className="mt-6">
        <AdminLoginForm />
      </div>
    </Card>
  );
}
