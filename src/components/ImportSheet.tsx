"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";
import { bangkokYearMonth, formatMoney, monthLabel } from "@/lib/format";
import { importTransactions } from "@/app/(app)/actions";
import { ArrowUpIcon, CloseIcon, CopyIcon } from "@/components/icons";
import { useI18n } from "@/components/LanguageProvider";
import { copyText } from "@/lib/clipboard";

/** Generic prompt for Gemini / any AI to turn ANY budgeting or banking app
 *  screenshot into the CSV that TOPtics imports — works for any pocket names,
 *  any app, any language. */
const AI_PROMPT = `From this screenshot of my budgeting / banking app, reply with RAW CSV only — no explanation, no \`\`\`, no markdown.

First line is the header:
category,budget,remaining

Then one row per pocket / envelope / category that is a MONTHLY SPENDING budget (one that has a budget or limit).

Rules:
- category = the name exactly as shown; drop any budget number in parentheses (e.g. "Food (15k)" -> "Food"). Keep the original language, do not translate.
- remaining = the large balance number on the card (money left).
- budget = the number after "/", or the "(Nk)" in the name where k = thousand (15k = 15000).
- numbers: no commas, no currency symbol, no decimals.
- SKIP anything that is NOT a monthly spending budget: savings goals, account or card balances, or pockets with no budget shown.

Example output:
category,budget,remaining
Food,15000,8656
Transport,4000,3894`;

const NEW_CAT = "__new__"; // create a new category from the CSV name
const SKIP_CAT = "__skip__"; // don't import this row

interface ImportRow {
  month: string; // YYYY-MM
  raw: string; // category text from the CSV
  budget: number;
  remaining: number;
  spent: number; // budget − remaining
  // a real category id, NEW_CAT (auto-create), or SKIP_CAT
  target: string;
  include: boolean;
}

const normName = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
const toNum = (s: string) => Number(String(s).replace(/[^0-9.\-]/g, ""));
const isYM = (s: string) => /^\d{4}-\d{2}$/.test(s);

function lastDayISO(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return `${y}-${String(m).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
}

function ymLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return monthLabel(new Date(y, m - 1, 1));
}

function parseCsv(
  csv: string,
  expenseCategories: Category[],
  defaultMonth: string
): ImportRow[] {
  const match = (name: string) => {
    const n = normName(name);
    return (
      expenseCategories.find((c) => normName(c.name) === n) ??
      expenseCategories.find(
        (c) => normName(c.name).replace(/s$/, "") === n.replace(/s$/, "")
      )
    );
  };

  const out: ImportRow[] = [];
  for (const line of csv.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    const parts = t.split(",").map((s) => s.trim());
    if (/^(month|category)$/i.test(parts[0])) continue; // header

    let month: string;
    let cat: string;
    let budgetS: string;
    let remainingS: string;
    if (parts.length >= 4 && isYM(parts[0])) {
      [month, cat, budgetS, remainingS] = parts;
    } else if (parts.length >= 3) {
      month = defaultMonth;
      [cat, budgetS, remainingS] = parts;
    } else {
      continue;
    }
    if (!isYM(month)) continue;

    const budget = toNum(budgetS);
    const remaining = toNum(remainingS);
    if (!Number.isFinite(budget) || !Number.isFinite(remaining)) continue;
    const spent = Math.round(budget - remaining);
    const m = match(cat);
    out.push({
      month,
      raw: cat,
      budget: Math.round(budget),
      remaining: Math.round(remaining),
      spent,
      // matched → use it; otherwise auto-create a category from the name
      target: m?.id ?? NEW_CAT,
      include: spent > 0,
    });
  }
  return out;
}

export function ImportSheet({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  );
  const monthOptions = useMemo(() => {
    const { year, month } = bangkokYearMonth(); // 0-based
    const opts: { value: string; label: string }[] = [];
    for (let i = 0; i < 18; i++) {
      const d = new Date(year, month - i, 1);
      opts.push({
        value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: monthLabel(d),
      });
    }
    return opts;
  }, []);

  const [defMonth, setDefMonth] = useState(monthOptions[0].value);
  const [csv, setCsv] = useState("");
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promptCopied, setPromptCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  async function copyPrompt() {
    const ok = await copyText(AI_PROMPT);
    if (ok) {
      setPromptCopied(true);
      setShowPrompt(false);
      setTimeout(() => setPromptCopied(false), 2000);
    } else {
      // Clipboard unavailable — reveal the prompt so it can be copied manually.
      setShowPrompt(true);
    }
  }

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  function reset() {
    setCsv("");
    setRows(null);
    setMsg(null);
    setError(null);
  }

  function preview() {
    setError(null);
    setMsg(null);
    const parsed = parseCsv(csv, expenseCategories, defMonth);
    if (parsed.length === 0) {
      setRows(null);
      setError(t("imp.errNoRows"));
      return;
    }
    setRows(parsed);
  }

  function updateRow(i: number, patch: Partial<ImportRow>) {
    setRows((rs) =>
      rs ? rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) : rs
    );
  }

  // Group rows by month for display, keeping each row's flat index.
  const groups = useMemo(() => {
    if (!rows) return [];
    const map = new Map<string, { i: number; r: ImportRow }[]>();
    rows.forEach((r, i) => {
      const g = map.get(r.month) ?? [];
      g.push({ i, r });
      map.set(r.month, g);
    });
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, items]) => ({ month, items }));
  }, [rows]);

  const selected = rows
    ? rows.filter((r) => r.include && r.target !== SKIP_CAT && r.spent > 0)
    : [];

  function confirm() {
    if (selected.length === 0) {
      setError(t("imp.errNothing"));
      return;
    }
    const items = selected.map((r) => {
      const matched =
        r.target !== NEW_CAT
          ? expenseCategories.find((c) => c.id === r.target)
          : undefined;
      return {
        category_id: matched ? matched.id : null,
        category_name: matched ? matched.name : r.raw,
        amount: r.spent,
        occurred_on: lastDayISO(r.month),
      };
    });
    const fd = new FormData();
    fd.set("items", JSON.stringify(items));
    setError(null);
    startTransition(async () => {
      const res = await importTransactions(fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      reset();
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 font-semibold text-bg shadow-glow transition-colors duration-200 hover:bg-teal-dark cursor-pointer"
      >
        <ArrowUpIcon className="w-5 h-5" />
        {t("imp.title")}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Import data"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex w-full flex-col sm:max-w-md bg-bg-soft border-t sm:border border-line sm:rounded-2xl rounded-t-2xl shadow-card max-h-[92dvh] overflow-hidden">
            <div className="flex flex-none items-center justify-between px-5 py-4 border-b border-line">
              <h2 className="text-lg font-bold">{t("imp.title")}</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted hover:text-ink hover:bg-bg-panel transition-colors duration-200 cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
              <p className="text-sm text-ink-muted">
                {t("imp.sheetDesc", {
                  fmt: "category,budget,remaining",
                  month: "month",
                })}
              </p>

              <button
                type="button"
                onClick={copyPrompt}
                className="flex items-center gap-1.5 self-start rounded-lg border border-line bg-bg-panel2 px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors duration-200 hover:border-teal hover:text-teal cursor-pointer"
              >
                <CopyIcon className="w-3.5 h-3.5" />
                {promptCopied ? t("ins.copied") : t("imp.copyPrompt")}
              </button>
              <p className="-mt-2 text-[11px] text-ink-muted/70">
                {t("imp.promptHint")}
              </p>
              {showPrompt ? (
                <textarea
                  readOnly
                  value={AI_PROMPT}
                  onFocus={(e) => e.currentTarget.select()}
                  rows={6}
                  aria-label="AI prompt"
                  className="w-full resize-none rounded-xl border border-line bg-bg-panel px-3 py-2 text-xs text-ink"
                />
              ) : null}

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="defMonth"
                  className="text-sm font-medium text-ink-muted"
                >
                  {t("imp.defaultMonth")}{" "}
                  <span className="text-ink-muted/60">
                    {t("imp.defaultMonthHint")}
                  </span>
                </label>
                <select
                  id="defMonth"
                  value={defMonth}
                  onChange={(e) => setDefMonth(e.target.value)}
                  className="rounded-xl bg-bg-panel border border-line px-4 py-3 focus:border-teal cursor-pointer"
                >
                  {monthOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={csv}
                onChange={(e) => setCsv(e.target.value)}
                rows={5}
                placeholder={
                  "category,budget,remaining\nFood,15000,8656\nTransport,4000,3894"
                }
                aria-label="Import CSV"
                className="w-full resize-none rounded-xl border border-line bg-bg-panel px-3 py-2 font-mono text-xs text-ink placeholder:text-ink-muted/50 focus:border-teal"
              />

              <button
                type="button"
                onClick={preview}
                disabled={!csv.trim()}
                className="flex items-center justify-center gap-2 rounded-xl border border-line bg-bg-panel2 px-4 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-teal hover:text-teal disabled:opacity-50 disabled:hover:border-line disabled:hover:text-ink cursor-pointer disabled:cursor-not-allowed"
              >
                {t("imp.preview")}
              </button>

              {error ? (
                <p role="alert" className="text-sm text-neg">
                  {error}
                </p>
              ) : null}
              {msg ? (
                <p role="status" className="text-sm text-teal-light">
                  {msg}
                </p>
              ) : null}

              {groups.map((g) => (
                <div key={g.month} className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    {ymLabel(g.month)}
                  </p>
                  {g.items.map(({ i, r }) => {
                    const isNew = r.target === NEW_CAT;
                    const isSkip = r.target === SKIP_CAT;
                    return (
                      <div
                        key={`${r.month}-${r.raw}-${i}`}
                        className={`rounded-xl border p-3 ${
                          isNew
                            ? "border-teal/40 bg-teal/[0.06]"
                            : "border-line bg-bg-panel"
                        } ${isSkip ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={r.include && !isSkip}
                            onChange={(e) =>
                              updateRow(i, { include: e.target.checked })
                            }
                            aria-label={`Include ${r.raw}`}
                            className="h-4 w-4 flex-none accent-teal cursor-pointer"
                          />
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">
                            {r.raw}
                          </span>
                          {isNew ? (
                            <span className="flex-none rounded-full bg-teal/15 px-1.5 py-0.5 text-[10px] font-semibold text-teal-light">
                              {t("ins.new")}
                            </span>
                          ) : null}
                          <span
                            className={`tabular-nums text-sm font-semibold ${
                              r.spent > 0 ? "text-neg" : "text-ink-muted"
                            }`}
                          >
                            {formatMoney(r.spent)}
                          </span>
                        </div>
                        <p className="mt-1 pl-6 text-[11px] text-ink-muted">
                          {t("imp.budgetLeft", {
                            budget: formatMoney(r.budget),
                            remaining: formatMoney(r.remaining),
                          })}
                        </p>
                        <div className="mt-2 flex items-center gap-2 pl-6">
                          <span className="text-[11px] text-ink-muted">
                            {t("tx.category")}
                          </span>
                          <select
                            value={r.target}
                            onChange={(e) =>
                              updateRow(i, {
                                target: e.target.value,
                                include: e.target.value !== SKIP_CAT,
                              })
                            }
                            className={`flex-1 rounded-lg border bg-bg-panel2 px-2 py-1.5 text-xs focus:border-teal cursor-pointer ${
                              isNew ? "border-teal/40" : "border-line"
                            }`}
                          >
                            <option value={NEW_CAT}>
                              {t("imp.create", { raw: r.raw })}
                            </option>
                            {expenseCategories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                            <option value={SKIP_CAT}>{t("imp.skip")}</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {rows ? (
              <div
                className="flex-none border-t border-line bg-bg-soft px-5 pt-3"
                style={{
                  paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
                }}
              >
                <button
                  type="button"
                  onClick={confirm}
                  disabled={pending || selected.length === 0}
                  className="w-full rounded-xl bg-teal px-4 py-3.5 font-semibold text-bg shadow-glow transition-colors duration-200 hover:bg-teal-dark disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {pending
                    ? t("imp.adding")
                    : t("imp.addN", { n: selected.length })}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
