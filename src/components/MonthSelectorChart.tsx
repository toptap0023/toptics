"use client";

import { useEffect, useMemo, useRef } from "react";
import type { TransactionView } from "@/lib/types";
import { formatMoney, HISTORY_START_ABS } from "@/lib/format";

const SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * A horizontally-scrollable income/expense bar chart that doubles as the
 * month picker: tap a month's bars to select it. Selected month is highlighted
 * and scrolled into view.
 */
export function MonthSelectorChart({
  transactions,
  baseYear,
  baseMonth,
  selectedOffset,
  onSelect,
  currency,
}: {
  transactions: TransactionView[];
  baseYear: number;
  baseMonth: number; // 0-11, represents offset 0 (current month)
  selectedOffset: number;
  onSelect: (offset: number) => void;
  currency: string;
}) {
  const current = baseYear * 12 + baseMonth;

  const data = useMemo(() => {
    const sums = new Map<number, { income: number; expense: number }>();
    // Always span from Jan 2025; expand further back only if older data exists.
    let earliest = Math.min(HISTORY_START_ABS, current);
    for (const t of transactions) {
      const [y, m] = t.occurred_on.split("-").map(Number);
      const abs = y * 12 + (m - 1);
      if (abs < earliest) earliest = abs;
      const cur = sums.get(abs) ?? { income: 0, expense: 0 };
      if (t.type === "income") cur.income += Number(t.amount);
      else cur.expense += Number(t.amount);
      sums.set(abs, cur);
    }
    // include the selected month even if it's in the future relative to data
    const last = Math.max(current, current + selectedOffset);
    const arr: {
      offset: number;
      year: number;
      month: number;
      income: number;
      expense: number;
    }[] = [];
    for (let a = earliest; a <= last; a++) {
      const s = sums.get(a) ?? { income: 0, expense: 0 };
      arr.push({
        offset: a - current,
        year: Math.floor(a / 12),
        month: ((a % 12) + 12) % 12,
        income: s.income,
        expense: s.expense,
      });
    }
    return arr;
  }, [transactions, current, selectedOffset]);

  const max = Math.max(1, ...data.map((d) => Math.max(d.income, d.expense)));
  const H = 70;

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>('[data-selected="true"]');
    if (el) {
      root.scrollTo({
        left: el.offsetLeft - root.clientWidth / 2 + el.clientWidth / 2,
        behavior: "smooth",
      });
    }
  }, [selectedOffset, data.length]);

  return (
    <div
      ref={scrollRef}
      className="no-scrollbar overflow-x-auto overscroll-x-contain"
      role="group"
      aria-label="Select month"
    >
      <div className="flex min-w-max items-end gap-1 px-4">
        {data.map((d) => {
          const sel = d.offset === selectedOffset;
          const incH = (d.income / max) * H;
          const expH = (d.expense / max) * H;
          const label = `${SHORT[d.month]} ${d.year} · income ${formatMoney(
            d.income,
            currency
          )}, expense ${formatMoney(d.expense, currency)}`;
          return (
            <button
              key={d.offset}
              type="button"
              data-selected={sel}
              aria-pressed={sel}
              aria-label={label}
              onClick={() => onSelect(d.offset)}
              className={`flex flex-none flex-col items-center gap-1.5 rounded-xl px-2 pt-2 pb-1.5 transition-colors duration-200 cursor-pointer ${
                sel ? "bg-bg-panel2" : "hover:bg-bg-panel"
              }`}
            >
              <div className="flex items-end gap-0.5" style={{ height: H }}>
                <div
                  className="w-2.5 rounded-t bg-pos"
                  style={{ height: Math.max(incH, d.income > 0 ? 3 : 0) }}
                />
                <div
                  className="w-2.5 rounded-t bg-neg"
                  style={{ height: Math.max(expH, d.expense > 0 ? 3 : 0) }}
                />
              </div>
              <span
                className={`text-[11px] leading-none ${
                  sel ? "font-semibold text-ink" : "text-ink-muted"
                }`}
              >
                {SHORT[d.month]}
              </span>
              <span
                className={`text-[9px] leading-none ${
                  sel ? "text-ink-muted" : "text-ink-muted/60"
                }`}
              >
                {String(d.year).slice(2)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
