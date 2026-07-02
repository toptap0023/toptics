// Route-level skeleton shown while the dashboard's server data loads.
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mx-auto max-w-2xl px-5 py-3.5">
        <div className="h-6 w-24 rounded-lg bg-bg-panel" />
      </div>
      <div className="mx-auto max-w-2xl px-5 pb-3">
        <div className="h-28 rounded-2xl bg-bg-panel" />
      </div>
      <div className="mx-auto max-w-2xl px-5 pt-4 flex flex-col gap-3">
        <div className="h-16 rounded-2xl bg-bg-panel" />
        <div className="h-12 rounded-xl bg-bg-panel" />
        <div className="mt-2 h-40 rounded-2xl bg-bg-panel" />
        <div className="h-40 rounded-2xl bg-bg-panel" />
      </div>
    </div>
  );
}
