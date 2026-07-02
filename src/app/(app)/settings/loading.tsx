// Route-level skeleton shown while Settings' server data loads
// (covers /settings and /settings/categories).
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mx-auto max-w-2xl px-5 py-3.5">
        <div className="h-6 w-24 rounded-lg bg-bg-panel" />
      </div>
      <div className="mx-auto max-w-2xl px-5 pt-5 flex flex-col gap-4">
        <div className="h-14 rounded-2xl bg-bg-panel" />
        <div className="h-32 rounded-2xl bg-bg-panel" />
        <div className="h-48 rounded-2xl bg-bg-panel" />
      </div>
    </div>
  );
}
