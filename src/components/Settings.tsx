"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category, TransactionView } from "@/lib/types";
import { Card, SectionTitle } from "@/components/Card";
import {
  ArrowDownIcon,
  CategoryGlyph,
  LogoutIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";
import { todayISO } from "@/lib/format";
import { createCategory, deleteCategory } from "@/app/(app)/actions";
import { ImportSheet } from "@/components/ImportSheet";
import { useI18n } from "@/components/LanguageProvider";
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

  // Category form
  const [cName, setCName] = useState("");
  const [cType, setCType] = useState<"expense" | "income">("expense");
  const [cInvest, setCInvest] = useState(false);

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

  function addCategory() {
    if (!cName.trim()) return setError(t("cat.nameError"));
    const fd = new FormData();
    fd.set("name", cName.trim());
    fd.set("type", cInvest ? "expense" : cType);
    fd.set("is_investment", String(cInvest));
    run(
      () => createCategory(fd),
      () => {
        setCName("");
        setCInvest(false);
      }
    );
  }

  function removeCategory(id: string) {
    if (!confirm(t("cat.confirmDelete"))) return;
    const fd = new FormData();
    fd.set("id", id);
    run(() => deleteCategory(fd));
  }

  const expense = categories.filter(
    (c) => c.type === "expense" && !c.is_investment
  );
  const income = categories.filter((c) => c.type === "income");
  const investment = categories.filter((c) => c.is_investment);

  return (
    <div className="px-5 pt-5 pb-2 flex flex-col gap-6">
      {error ? (
        <p role="alert" className="text-sm text-neg">
          {error}
        </p>
      ) : null}
      {/* Categories */}
      <section>
        <SectionTitle>{t("cat.title")}</SectionTitle>

        <div className="flex flex-col gap-3">
          <CategoryGroup
            heading={t("cat.expense")}
            items={expense}
            onRemove={removeCategory}
            pending={pending}
          />
          <CategoryGroup
            heading={t("cat.income")}
            items={income}
            onRemove={removeCategory}
            pending={pending}
          />
          <CategoryGroup
            heading={t("cat.investment")}
            items={investment}
            onRemove={removeCategory}
            pending={pending}
          />
        </div>

        <Card className="mt-3 p-4 flex flex-col gap-3">
          {cInvest ? (
            <div className="rounded-xl border border-teal/40 bg-teal/10 px-4 py-2.5 text-sm font-semibold text-teal">
              {t("cat.expense")}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-bg-panel2 p-1">
              {(["expense", "income"] as const).map((ty) => (
                <button
                  key={ty}
                  type="button"
                  onClick={() => setCType(ty)}
                  className={`rounded-lg py-2 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                    cType === ty
                      ? ty === "income"
                        ? "bg-pos text-bg"
                        : "bg-neg text-bg"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {ty === "income" ? t("cat.income") : t("cat.expense")}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">
                {t("cat.isInvestment")}
              </p>
              <p className="text-xs text-ink-muted">{t("cat.isInvestmentHint")}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={cInvest}
              aria-label={t("cat.isInvestment")}
              onClick={() => setCInvest((v) => !v)}
              className={`relative flex-none h-7 w-12 rounded-full transition-colors duration-200 cursor-pointer ${
                cInvest ? "bg-teal" : "bg-bg-panel2 border border-line"
              }`}
            >
              <span
                className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-bg shadow-sm transition-all duration-200 ${
                  cInvest ? "left-[26px]" : "left-1"
                }`}
              />
            </button>
          </div>

          <input
            value={cName}
            onChange={(e) => setCName(e.target.value)}
            placeholder={t("cat.newName")}
            aria-label={t("cat.newName")}
            className="rounded-xl bg-bg-panel border border-line px-4 py-3 focus:border-teal"
          />
          <button
            onClick={addCategory}
            disabled={pending}
            className="flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 font-semibold text-bg shadow-glow transition-colors duration-200 hover:bg-teal-dark disabled:opacity-60 cursor-pointer"
          >
            <PlusIcon className="w-5 h-5" />
            {t("cat.add")}
          </button>
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

function CategoryGroup({
  heading,
  items,
  onRemove,
  pending,
}: {
  heading: string;
  items: Category[];
  onRemove: (id: string) => void;
  pending: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <Card className="overflow-hidden">
      <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {heading}
      </p>
      <div className="divide-y divide-line">
        {items.map((c) => (
          <div key={c.id} className="flex items-center gap-3 px-4 py-2.5">
            <span
              className="grid h-8 w-8 flex-none place-items-center rounded-lg"
              style={{ backgroundColor: c.color + "22" }}
            >
              <CategoryGlyph
                icon={c.icon}
                className="w-4 h-4"
                style={{ color: c.color }}
              />
            </span>
            <p className="min-w-0 flex-1 truncate text-sm">{c.name}</p>
            <button
              onClick={() => onRemove(c.id)}
              disabled={pending}
              aria-label={`Delete category ${c.name}`}
              className="text-ink-muted transition-colors duration-200 hover:text-neg disabled:opacity-40 cursor-pointer"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
