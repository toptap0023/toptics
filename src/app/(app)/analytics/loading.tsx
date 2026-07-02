// Route-level skeleton shown while Insights' server data loads.
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mx-auto max-w-2xl px-5 pt-3.5 pb-2.5 flex items-center justify-between">
        <div className="h-6 w-24 rounded-lg bg-bg-panel" />
        <div className="h-4 w-16 rounded-lg bg-bg-panel" />
      </div>
      <div className="mx-auto max-w-2xl px-5 pb-3 flex gap-2">
        <div className="h-9 w-20 rounded-full bg-bg-panel" />
        <div className="h-9 w-20 rounded-full bg-bg-panel" />
        <div className="h-9 w-20 rounded-full bg-bg-panel" />
      </div>
      <div className="mx-auto max-w-2xl px-5 pt-5 flex flex-col gap-5">
        <div className="h-44 rounded-2xl bg-bg-panel" />
        <div className="h-56 rounded-2xl bg-bg-panel" />
        <div className="h-40 rounded-2xl bg-bg-panel" />
      </div>
    </div>
  );
}
