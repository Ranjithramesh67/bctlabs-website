import type { ReactNode } from "react";

import { Container } from "@/components/ui";

// Server Component: minimal centered shell for unauthenticated admin screens.
export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Container className="flex flex-1 flex-col items-center justify-center py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">BCTLABS Admin</h1>
        </div>
        <div className="w-full max-w-md">{children}</div>
      </Container>
    </div>
  );
}
