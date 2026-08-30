export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl animate-pulse space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-8 w-48 rounded bg-slate-200" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="aspect-video rounded-2xl bg-slate-200 lg:col-span-2" />
        <div className="space-y-5">
          <div className="h-32 rounded-2xl bg-slate-200" />
          <div className="h-32 rounded-2xl bg-slate-200" />
        </div>
      </div>
    </main>
  );
}
