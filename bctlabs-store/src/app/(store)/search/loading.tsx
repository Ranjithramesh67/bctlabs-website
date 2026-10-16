import { Container } from "@/components/ui";

export default function SearchLoading() {
  return (
    <Container className="py-10">
      <div className="border-b border-slate-200 pb-6">
        <div className="h-9 w-40 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-5 h-11 w-full max-w-xl animate-pulse rounded-xl bg-slate-200" />
      </div>

      <div className="mt-8">
        <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="aspect-square animate-pulse bg-slate-200" />
            <div className="space-y-3 p-4">
              <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="h-9 w-full animate-pulse rounded-xl bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
