import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-12">
      <div className="w-12 h-12 rounded-2xl bg-bg-panel2 grid place-items-center text-ink-muted mb-3">
        {icon}
      </div>
      <p className="font-semibold text-ink">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-ink-muted max-w-xs">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
