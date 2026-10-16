import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { Card, Container } from "@/components/ui";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string | string[] }>;
}) {
  const session = await getSession();
  if (session.customerId) redirect("/account");

  const params = await searchParams;
  const redirectTo = typeof params.redirectTo === "string" ? params.redirectTo : undefined;

  return (
    <Container className="py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Welcome back. Sign in to your account.</p>
        </div>
        <Card className="p-6 sm:p-8">
          <LoginForm redirectTo={redirectTo} />
        </Card>
      </div>
    </Container>
  );
}
