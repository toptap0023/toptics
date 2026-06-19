"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Category, TransactionView, Wallet } from "@/lib/types";
import { Card } from "@/components/Card";
import { Amount } from "@/components/Amount";
import { EmptyState } from "@/components/EmptyState";
import { TransactionRow } from "@/components/TransactionRow";
import { TransactionSheet } from "@/components/TransactionSheet";
import { MonthSelectorChart } from "@/components/MonthSelectorChart";
import { ChartIcon, ChevronRightIcon, ListIcon } from "@/components/icons";
import { bangkokYearMonth, formatDateGroup, monthLabel } from "@/lib/format";

export function MonthHome({
  wallets,
  categories,
  transactions,
  currency,
}: {
  wallets: Wallet[];
  categories: Category[];
  transactions: TransactionView[];
  currency: string;
}) {
  const { year: baseYear, month: baseMonth } = bangkokYearMonth();
  const [offset, setOffset] = useState(0); // 0 = current month

  const view = new Date(baseYear, baseMonth + offset, 1);
  const vYear = view.getFullYear();
  const vMonth = view.getMonth();

  const monthTx = useMemo(
    () =>
      transactions.filter((t) => {
        const [y, m] = t.occurred_on.split("-").map(Number);
        return y === vYear && m - 1 === vMonth;
      }),
    [transactions, vYear, vMonth]
  );

  const income = monthTx
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expense = monthTx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const groups = useMemo(() => {
    const g = new Map<string, TransactionView[]>();
    for (const t of monthTx) {
      const arr = g.get(t.occurred_on) ?? [];
      arr.push(t);
      g.set(t.occurred_on, arr);
    }
    return [...g.entries()];
  }, [monthTx]);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg-soft/80 backdrop-blur-lg pt-safe">
        <div className="mx-auto flex max-w-2xl items-center px-5 py-3.5">
          <h1 className="text-xl font-bold tracking-tight">
            TOP<span className="text-teal">tics</span>
          </h1>
        </div>

        {/* Month selector — tap a month's bars, scroll left/right */}
        <div className="mx-auto max-w-2xl pb-3">
          <p className="px-5 pb-1.5 text-center text-base font-semibold tabular-nums">
            {monthLabel(view)}
          </p>
          <MonthSelectorChart
            transactions={transactions}
            baseYear={baseYear}
            baseMonth={baseMonth}
            selectedOffset={offset}
            onSelect={setOffset}
            currency={currency}
          />
          <div className="flex items-center justify-center gap-4 pt-1.5 text-[11px] text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-pos" aria-hidden="true" />
              Income
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-neg" aria-hidden="true" />
              Expense
            </span>
          </div>
        </div>
      </header>

      {/* Month totals */}
      <div className="mx-auto max-w-2xl px-5 pt-4">
        <Card className="flex items-center justify-around p-3">
          <div className="text-center">
            <p className="text-xs text-ink-muted">Income</p>
            <p className="mt-0.5 font-semibold">
              <Amount value={income} currency={currency} type="income" />
            </p>
          </div>
          <div className="h-8 w-px bg-line" />
          <div className="text-center">
            <p className="text-xs text-ink-muted">Expense</p>
            <p className="mt-0.5 font-semibold">
              <Amount value={expense} currency={currency} type="expense" />
            </p>
          </div>
          <div className="h-8 w-px bg-line" />
          <div className="text-center">
            <p className="text-xs text-ink-muted">Net</p>
            <p className="mt-0.5 font-semibold">
              <Amount value={income - expense} currency={currency} signed />
            </p>
          </div>
        </Card>

        {/* CTA: jump to this month's Insights */}
        <Link
          href={`/analytics?ym=${vYear}-${String(vMonth + 1).padStart(2, "0")}`}
          className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-line bg-bg-panel px-4 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-teal hover:text-teal active:bg-bg-panel2 cursor-pointer"
        >
          <ChartIcon className="w-4 h-4" />
          View {monthLabel(view)} insights
          <ChevronRightIcon className="w-4 h-4" />
        </Link>
      </div>

      {/* Transactions list for the selected month */}
      <div className="mx-auto max-w-2xl px-5 pb-4 pt-5 flex flex-col gap-5">
        {groups.length === 0 ? (
          <Card>
            <EmptyState
              icon={<ListIcon className="w-6 h-6" />}
              title="No transactions this month"
              description="Tap the + button to add one, or pick another month above."
            />
          </Card>
        ) : (
          groups.map(([date, items]) => {
            const dayTotal = items.reduce(
              (s, t) =>
                s + (t.type === "income" ? Number(t.amount) : -Number(t.amount)),
              0
            );
            return (
              <section key={date}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold text-ink-muted">
                    {formatDateGroup(date)}
                  </h2>
                  <Amount
                    value={dayTotal}
                    currency={currency}
                    signed
                    className="text-xs text-ink-muted"
                  />
                </div>
                <Card className="divide-y divide-line overflow-hidden">
                  {items.map((t) => (
                    <TransactionRow
                      key={t.id}
                      tx={t}
                      wallets={wallets}
                      categories={categories}
                      currency={currency}
                    />
                  ))}
                </Card>
              </section>
            );
          })
        )}
      </div>

      <TransactionSheet wallets={wallets} categories={categories} />
    </>
  );
}
