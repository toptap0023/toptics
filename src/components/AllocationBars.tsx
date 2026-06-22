"use client";

import { formatMoney } from "@/lib/format";
import { useI18n } from "@/components/LanguageProvider";

/**
 * Three horizontal bars on ONE shared scale comparing income, living expense,
 * and investment for the selected period. Bars (not a donut) because investment
 * can exceed income — bars stay truthful for any relationship between the three.
 */
export function AllocationBars({
  income,
  expense,
  investment,
  currency,
}: {
  income: number;
  expense: number;
  investment: number;
  currency: string;
}) {
  const { t } = useI18n();
  const max = Math.max(income, expense, investment, 1);

  const rows: { label: string; value: number; bar: string }[] = [
    { label: t("common.income"), value: income, bar: "bg-pos" },
    { label: t("common.expense"), value: expense, bar: "bg-neg" },
    { label: t("common.investment"), value: investment, bar: "bg-teal" },
  ];

  const net = income - expense - investment;

  return (
    <div className="flex flex-col gap-3">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="w-16 flex-none text-xs text-ink-muted">
            {r.label}
          </span>
          <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-bg-soft">
            <div
              className={`h-full rounded-full ${r.bar} transition-[width] duration-300`}
              style={{
                width:
                  r.value > 0
                    ? `max(3px, ${(r.value / max) * 100}%)`
                    : "0%",
              }}
            />
          </div>
          <span className="w-24 flex-none text-right text-sm font-semibold tabular-nums text-ink">
            {formatMoney(r.value, currency)}
          </span>
        </div>
      ))}

      <div className="mt-1 flex items-center justify-between border-t border-line pt-3">
        <span className="text-sm text-ink-muted">
          {net >= 0 ? t("net.leftover") : t("net.drawdown")}
        </span>
        <span
          className={`text-sm font-bold tabular-nums ${net >= 0 ? "text-pos" : "text-neg"}`}
        >
          {formatMoney(net, currency, { sign: true })}
        </span>
      </div>
    </div>
  );
}
