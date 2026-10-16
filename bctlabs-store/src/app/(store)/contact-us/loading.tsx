import { Container } from "@/components/ui";

export default function ContactLoading() {
  return (
    <Container className="py-10">
      <div className="animate-pulse">
        <div className="h-4 w-32 rounded bg-slate-200" />

        <div className="mt-6 space-y-4">
          <div className="h-9 w-56 rounded bg-slate-200 sm:h-10" />
          <div className="h-4 w-full max-w-xl rounded bg-slate-200" />
          <div className="h-4 w-3/4 max-w-lg rounded bg-slate-200" />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {[0, 1, 2].map((row) => (
              <div key={row} className="space-y-2">
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="h-5 w-2/3 rounded bg-slate-200" />
              </div>
            ))}
          </div>

          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              {[0, 1, 2, 3].map((field) => (
                <div key={field} className="space-y-2">
                  <div className="h-4 w-20 rounded bg-slate-200" />
                  <div className="h-11 w-full rounded-xl bg-slate-200" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-32 w-full rounded-xl bg-slate-200" />
            </div>
            <div className="h-11 w-40 rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    </Container>
  );
}
