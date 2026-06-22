"use client";

import type { TransactionView } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/format";
import { TrendUpIcon } from "@/components/icons";
import { useI18n } from "@/components/LanguageProvider";

export interface InvestSub {
  label: string;
  color: string;
  value: number;
}

/**
 * Investment summary — rendered only when investment > 0. Shows the period
 * total, its share of total money out, an optional "× income" insight, a
 * by-type breakdown and the most recent investment transactions.
 */
export function InvestmentSummary({
  investment,
  expense,
  income,
  investBySub,
  investList,
  currency,
}: {
  investment: number;
  expense: number; // living expense (for the outflow share)
  income: number;
  investBySub: InvestSub[];
  investList: TransactionView[];
  currency: string;
}) {
  const { t } = useI18n();

  const outflow = expense + investment;
  const pct = outflow > 0 ? Math.round((investment / outflow) * 100) : 0;
  const showTimes = income > 0 && investment > income;

  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-teal/15">
          <TrendUpIcon className="h-5 w-5 text-teal" />
        </span>
        <div className="min-w-0">
          <p className="text-3xl font-bold tabular-nums text-teal">
            {formatMoney(investment, currency)}
          </p>
          <p className="mt-0.5 text-sm text-ink-muted">
            {t("ins.investedTotal")}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-sm text-ink-muted">
          {t("ins.ofOutflow", { pct })}
        </span>
        {showTimes ? (
          <span className="rounded-full bg-teal/15 px-2.5 py-1 text-xs font-semibold text-teal">
            {t("ins.timesIncome", { x: (investment / income).toFixed(1) })}
          </span>
        ) : null}
      </div>

      {investBySub.length > 0 ? (
        <div className="mt-4 border-t border-line pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {t("ins.investByType")}
          </p>
          <ul className="flex flex-col divide-y divide-line/50">
            {investBySub.map((s) => {
              const share =
                investment > 0 ? Math.round((s.value / investment) * 100) : 0;
              return (
                <li key={s.label} className="flex items-center gap-2 py-1.5">
                  <span
                    className="h-2.5 w-2.5 flex-none rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">
                    {s.label}
                  </span>
                  <span className="tabular-nums text-sm text-ink">
                    {formatMoney(s.value, currency)}
                  </span>
                  <span className="w-10 flex-none text-right text-xs tabular-nums text-ink-muted">
                    {share}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {investList.length > 0 ? (
        <div className="mt-4 border-t border-line pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {t("ins.recentInvest")}
          </p>
          <ul className="flex flex-col divide-y divide-line/50">
            {investList.slice(0, 5).map((tx) => (
              <li key={tx.id} className="flex items-center gap-2 py-1.5">
                <span className="w-16 flex-none text-xs tabular-nums text-ink-muted">
                  {formatDate(tx.occurred_on)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-ink">
                  {tx.note || tx.category?.name || ""}
                </span>
                <span className="tabular-nums text-sm font-semibold text-ink">
                  {formatMoney(Number(tx.amount), currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-ink-muted">{t("ins.viewPortfolio")}</p>
    </div>
  );
}
