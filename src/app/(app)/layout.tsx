import { BottomNav } from "@/components/BottomNav";
import { ToastProvider } from "@/components/Toast";

// Auth is enforced in middleware (src/middleware.ts) for every non-public route,
// so we don't repeat getUser() here — that duplicate round-trip per render (and
// per prefetch) was flooding Supabase Auth and racing token refreshes.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-dvh">
        <div className="mx-auto max-w-2xl pb-28">{children}</div>
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
