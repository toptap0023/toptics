import { LogoutIcon } from "@/components/icons";

export function AppHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg-soft/85 backdrop-blur-lg pt-safe">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-5 py-3.5">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight truncate">{title}</h1>
          {subtitle ? (
            <p className="text-xs text-ink-muted truncate">{subtitle}</p>
          ) : null}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {right}
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              aria-label="Sign out"
              className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-bg-panel text-ink-muted transition-colors duration-200 hover:text-ink hover:border-ink-muted/40 cursor-pointer"
            >
              <LogoutIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
