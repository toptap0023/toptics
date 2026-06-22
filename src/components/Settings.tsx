"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Category, TransactionView } from "@/lib/types";
import { Card, SectionTitle } from "@/components/Card";
import {
  ArrowDownIcon,
  ChevronRightIcon,
  LogoutIcon,
  TagIcon,
} from "@/components/icons";
import { todayISO } from "@/lib/format";
import { ImportSheet } from "@/components/ImportSheet";
import { useI18n } from "@/components/LanguageProvider";
import { useToast } from "@/components/Toast";
import { copyText } from "@/lib/clipboard";

/* ----------------------------- CSV export ----------------------------- */

const EXPORT_RANGES: { months: number; key: string; meta: string }[] = [
  { months: 1, key: "export.thisMonth", meta: "This month" },
  { months: 3, key: "export.3m", meta: "3 months" },
  { months: 6, key: "export.6m", meta: "6 months" },
  { months: 12, key: "export.1y", meta: "1 year" },
];

/** First day of the month that is (months-1) before the month of `today`. */
function rangeStart(today: string, months: number): string {
  const [y, m] = today.split("-").map(Number);
  const absStart = y * 12 + (m - 1) - (months - 1);
  const sy = Math.floor(absStart / 12);
  const sm = ((absStart % 12) + 12) % 12;
  return `${sy}-${String(sm + 1).padStart(2, "0")}-01`;
}

function csvCell(s: string): string {
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function buildCsv(rows: TransactionView[]): string {
  const header = "date,type,category,amount,note";
  const lines = rows.map((t) =>
    [
      t.occurred_on,
      t.type,
      csvCell(t.category?.name ?? "Uncategorized"),
      String(Math.round(Number(t.amount))),
      csvCell(t.note ?? ""),
    ].join(",")
  );
  return [header, ...lines].join("\n");
}

export function Settings({
  categories,
  transactions,
}: {
  categories: Category[];
  transactions: TransactionView[];
}) {
  const router = useRouter();
  const { t } = useI18n();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [exportCsv, setExportCsv] = useState<string | null>(null);

  async function exportRange(meta: string, months: number) {
    const today = todayISO();
    const start = rangeStart(today, months);
    const rows = transactions
      .filter((tx) => tx.occurred_on >= start && tx.occurred_on <= today)
      .slice()
      .sort((a, b) => a.occurred_on.localeCompare(b.occurred_on));

    if (rows.length === 0) {
      setExportCsv(null);
      setExportMsg(`No transactions in the last ${meta.toLowerCase()}.`);
      return;
    }

    const header = `# TOPtics export | ${meta} | ${start}..${today} | currency: THB | ${rows.length} rows`;
    const csv = `${header}\n${buildCsv(rows)}`;
    const ok = await copyText(csv);
    if (ok) {
      setExportCsv(null);
      toast(t("toast.copied"));
      setExportMsg(
        `Copied ${rows.length} rows (${meta}) to clipboard — paste into your AI chat.`
      );
    } else {
      // Clipboard unavailable — show the text so it can be copied manually.
      setExportCsv(csv);
      setExportMsg(
        `${rows.length} rows (${meta}) ready — tap the box, select all, and copy.`
      );
    }
  }

  function run(fn: () => Promise<{ error?: string } | void>, after?: () => void) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res && "error" in res && res.error) {
        setError(res.error);
        return;
      }
      after?.();
      router.refresh();
    });
  }

  return (
    <div className="px-5 pt-5 pb-2 flex flex-col gap-6">
      {error ? (
        <p role="alert" className="text-sm text-neg">
          {error}
        </p>
      ) : null}
      {/* Settings menu */}
      <section>
        <Card className="overflow-hidden divide-y divide-line">
          <Link
            href="/settings/categories"
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-bg-panel2/50 transition-colors duration-200"
          >
            <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-teal/15">
              <TagIcon className="w-4 h-4 text-teal" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium">{t("cat.title")}</span>
              <span className="block text-xs text-ink-muted">รายรับ · รายจ่าย · ลงทุน</span>
            </span>
            <ChevronRightIcon className="w-4 h-4 text-ink-muted flex-none" />
          </Link>
        </Card>
      </section>

      {/* Data — import & export */}
      <section>
        <SectionTitle>{t("data.title")}</SectionTitle>
        <div className="flex flex-col gap-3">
          <Card className="p-4 flex flex-col gap-3">
            <p className="text-sm text-ink-muted">{t("import.desc")}</p>
            <ImportSheet categories={categories} />
          </Card>

          <Card className="p-4 flex flex-col gap-3">
            <p className="text-sm font-medium">{t("export.title")}</p>
            <p className="text-sm text-ink-muted">{t("export.desc")}</p>
            <div className="grid grid-cols-2 gap-2">
              {EXPORT_RANGES.map((r) => (
                <button
                  key={r.months}
                  type="button"
                  onClick={() => exportRange(r.meta, r.months)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-line bg-bg-panel2 px-4 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-teal hover:text-teal cursor-pointer"
                >
                  <ArrowDownIcon className="w-4 h-4" />
                  {t(r.key)}
                </button>
              ))}
            </div>
            {exportMsg ? (
              <p role="status" className="text-sm text-teal-light">
                {exportMsg}
              </p>
            ) : null}
            {exportCsv ? (
              <textarea
                readOnly
                value={exportCsv}
                onFocus={(e) => e.currentTarget.select()}
                rows={6}
                aria-label="Exported CSV"
                className="w-full resize-none rounded-xl border border-line bg-bg-panel px-3 py-2 font-mono text-xs text-ink"
              />
            ) : null}
          </Card>
        </div>
      </section>

      {/* Sign out */}
      <form action="/auth/signout" method="post" className="pt-1">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-bg-panel px-4 py-3.5 text-sm font-semibold text-neg transition-colors duration-200 hover:border-neg/50 cursor-pointer"
        >
          <LogoutIcon className="w-4 h-4" />
          {t("signout")}
        </button>
      </form>
    </div>
  );
}

