"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category, TransactionView, Wallet } from "@/lib/types";
import { Card, SectionTitle } from "@/components/Card";
import {
  ArrowDownIcon,
  CategoryGlyph,
  LogoutIcon,
  PlusIcon,
  TrashIcon,
  WalletIcon,
} from "@/components/icons";
import { formatMoney, todayISO } from "@/lib/format";
import { createCategory, deleteCategory, updateWallet } from "@/app/(app)/actions";
import { ImportSheet } from "@/components/ImportSheet";
import { useI18n } from "@/components/LanguageProvider";

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

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function Settings({
  wallets,
  categories,
  transactions,
}: {
  wallets: Wallet[];
  categories: Category[];
  transactions: TransactionView[];
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
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

  const wallet = wallets[0];
  const [wName, setWName] = useState(wallet?.name ?? "");
  const [wStart, setWStart] = useState(
    wallet ? String(Math.round(wallet.starting_balance)) : ""
  );

  // Category form
  const [cName, setCName] = useState("");
  const [cType, setCType] = useState<"expense" | "income">("expense");

  function run(fn: () => Promise<{ error?: string } | void>, after?: () => void) {
    setError(null);
    setSaved(false);
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

  function saveWallet() {
    if (!wName.trim()) return setError(t("wallet.nameError"));
    if (!wallet) return;
    const fd = new FormData();
    fd.set("id", wallet.id);
    fd.set("name", wName.trim());
    fd.set("starting_balance", wStart || "0");
    run(() => updateWallet(fd), () => setSaved(true));
  }

  function addCategory() {
    if (!cName.trim()) return setError(t("cat.nameError"));
    const fd = new FormData();
    fd.set("name", cName.trim());
    fd.set("type", cType);
    run(() => createCategory(fd), () => setCName(""));
  }

  function removeCategory(id: string) {
    if (!confirm(t("cat.confirmDelete"))) return;
    const fd = new FormData();
    fd.set("id", id);
    run(() => deleteCategory(fd));
  }

  const expense = categories.filter((c) => c.type === "expense");
  const income = categories.filter((c) => c.type === "income");

  return (
    <div className="px-5 pt-5 pb-2 flex flex-col gap-6">
      {error ? (
        <p role="alert" className="text-sm text-neg">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="text-sm text-pos">
          {t("wallet.saved")}
        </p>
      ) : null}

      {/* Wallet */}
      <section>
        <SectionTitle>{t("wallet.title")}</SectionTitle>
        <Card className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span
              className="grid h-10 w-10 flex-none place-items-center rounded-xl"
              style={{ backgroundColor: (wallet?.color ?? "#0a84ff") + "22" }}
            >
              <WalletIcon
                className="w-5 h-5"
                style={{ color: wallet?.color ?? "#0a84ff" }}
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{wallet?.name ?? "—"}</p>
              <p className="text-xs text-ink-muted">
                {t("wallet.startsAt")}{" "}
                {formatMoney(Number(wallet?.starting_balance ?? 0))}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="wname" className="text-sm font-medium text-ink-muted">
              {t("wallet.name")}
            </label>
            <input
              id="wname"
              value={wName}
              onChange={(e) => setWName(e.target.value)}
              placeholder="e.g. Cash, Bank"
              className="rounded-xl bg-bg-panel border border-line px-4 py-3 focus:border-teal"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="wstart" className="text-sm font-medium text-ink-muted">
              {t("wallet.balance")} <span className="text-ink-muted/60">(฿)</span>
            </label>
            <input
              id="wstart"
              type="number"
              inputMode="numeric"
              step="1"
              value={wStart}
              onChange={(e) => setWStart(e.target.value)}
              placeholder="0"
              className="rounded-xl bg-bg-panel border border-line px-4 py-3 tabular-nums focus:border-teal"
            />
          </div>
          <button
            onClick={saveWallet}
            disabled={pending}
            className="flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 font-semibold text-bg shadow-glow transition-colors duration-200 hover:bg-teal-dark disabled:opacity-60 cursor-pointer"
          >
            {t("wallet.save")}
          </button>
        </Card>
      </section>

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
        </div>

        <Card className="mt-3 p-4 flex flex-col gap-3">
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
