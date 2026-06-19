"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Category, TransactionView, Wallet } from "@/lib/types";
import { todayISO } from "@/lib/format";
import {
  createTransaction,
  updateTransaction,
} from "@/app/(app)/actions";
import { CategoryGlyph, CloseIcon, PlusIcon } from "@/components/icons";

/** Shift a YYYY-MM-DD date by a number of days (UTC-safe). */
function shiftDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** Shift a YYYY-MM-DD date by a number of months (UTC-safe, day clamped). */
function shiftMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, 1));
  dt.setUTCMonth(dt.getUTCMonth() + months);
  // clamp day to the target month's length
  const lastDay = new Date(
    Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 0)
  ).getUTCDate();
  dt.setUTCDate(Math.min(d, lastDay));
  return dt.toISOString().slice(0, 10);
}

/** Remember the last date used to add a transaction, for 24h. */
const REMEMBER_KEY = "toptics:lastTxDate";
const REMEMBER_MS = 24 * 60 * 60 * 1000;

function readRememberedDate(): string | null {
  try {
    const raw = localStorage.getItem(REMEMBER_KEY);
    if (!raw) return null;
    const { date, savedAt } = JSON.parse(raw) as {
      date?: string;
      savedAt?: number;
    };
    if (typeof date !== "string" || typeof savedAt !== "number") return null;
    if (Date.now() - savedAt > REMEMBER_MS) return null;
    return date;
  } catch {
    return null;
  }
}

function rememberDate(date: string) {
  try {
    localStorage.setItem(
      REMEMBER_KEY,
      JSON.stringify({ date, savedAt: Date.now() })
    );
  } catch {
    // ignore storage failures (private mode, etc.)
  }
}

interface Props {
  wallets: Wallet[];
  categories: Category[];
  /** Provide to open in edit mode. Otherwise a new transaction is created. */
  initial?: TransactionView;
  /** Render-prop trigger. If omitted, a floating action button is shown. */
  trigger?: (open: () => void) => React.ReactNode;
}

export function TransactionSheet({
  wallets,
  categories,
  initial,
  trigger,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"income" | "expense">(
    initial?.type ?? "expense"
  );
  const [selectedCat, setSelectedCat] = useState<string>(
    initial?.category_id ?? ""
  );
  const [date, setDate] = useState<string>(initial?.occurred_on ?? todayISO());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const isEdit = Boolean(initial);
  const filteredCategories = categories.filter((c) => c.type === type);
  const today = todayISO();

  useEffect(() => {
    if (open) {
      setError(null);
      setType(initial?.type ?? "expense");
      setSelectedCat(initial?.category_id ?? "");
      // Edit keeps its own date; a new entry defaults to the last date used
      // within 24h (handy for back-entering several items), else today.
      setDate(initial?.occurred_on ?? readRememberedDate() ?? todayISO());
      const t = setTimeout(() => firstFieldRef.current?.focus(), 60);
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
  }, [open, initial]);

  function handleSubmit(formData: FormData) {
    formData.set("type", type);
    formData.set("occurred_on", date);
    startTransition(async () => {
      const res = isEdit
        ? await updateTransaction(formData)
        : await createTransaction(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      if (!isEdit) rememberDate(date);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      {trigger ? (
        trigger(() => setOpen(true))
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Add transaction"
          className="fixed bottom-[88px] right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-teal text-bg shadow-glow transition-transform duration-200 hover:bg-teal-dark active:scale-95 cursor-pointer"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        >
          <PlusIcon className="w-7 h-7" />
        </button>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={isEdit ? "Edit transaction" : "Add transaction"}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex w-full flex-col sm:max-w-md bg-bg-soft border-t sm:border border-line sm:rounded-2xl rounded-t-2xl shadow-card max-h-[92dvh] overflow-hidden">
            <div className="flex flex-none items-center justify-between px-5 py-4 border-b border-line">
              <h2 className="text-lg font-bold">
                {isEdit ? "Edit transaction" : "New transaction"}
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted hover:text-ink hover:bg-bg-panel transition-colors duration-200 cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <form
              action={handleSubmit}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
              {initial ? (
                <input type="hidden" name="id" value={initial.id} />
              ) : null}

              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-bg-panel p-1">
                {(["expense", "income"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setType(t);
                      setSelectedCat("");
                    }}
                    className={`rounded-lg py-2.5 text-sm font-semibold capitalize transition-colors duration-200 cursor-pointer ${
                      type === t
                        ? t === "income"
                          ? "bg-pos text-bg"
                          : "bg-neg text-bg"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {error ? (
                <p role="alert" className="text-sm text-neg">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="amount" className="text-sm font-medium text-ink-muted">
                  Amount
                </label>
                <input
                  ref={firstFieldRef}
                  id="amount"
                  name="amount"
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="0"
                  required
                  defaultValue={
                    initial ? String(Math.round(initial.amount)) : ""
                  }
                  placeholder="0"
                  className="rounded-xl bg-bg-panel border border-line px-4 py-3 text-2xl font-bold tabular-nums focus:border-teal"
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-ink-muted">
                  Category
                </span>
                <input type="hidden" name="category_id" value={selectedCat} />
                <div className="grid grid-cols-4 gap-2">
                  {filteredCategories.map((c) => {
                    const active = selectedCat === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCat(active ? "" : c.id)}
                        aria-pressed={active}
                        className={`flex flex-col items-center gap-1.5 rounded-2xl border p-2 transition-colors duration-200 cursor-pointer ${
                          active
                            ? "border-teal bg-teal/15"
                            : "border-line bg-bg-panel2 hover:bg-bg-panel2/70"
                        }`}
                      >
                        <span
                          className="grid h-11 w-11 place-items-center rounded-full"
                          style={{ backgroundColor: c.color + "22" }}
                        >
                          <CategoryGlyph
                            icon={c.icon}
                            className="w-6 h-6"
                            style={{ color: c.color }}
                          />
                        </span>
                        <span className="w-full truncate text-center text-[11px] leading-tight text-ink">
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <input type="hidden" name="wallet_id" value={wallets[0]?.id ?? ""} />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="occurred_on" className="text-sm font-medium text-ink-muted">
                  Date
                </label>
                <input
                  id="occurred_on"
                  name="occurred_on"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-xl bg-bg-panel border border-line px-4 py-3 focus:border-teal cursor-pointer"
                />
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {(
                    [
                      { label: "Yesterday", value: shiftDays(today, -1) },
                      { label: "Last month", value: shiftMonths(today, -1) },
                    ] as const
                  ).map((q) => {
                    const active = date === q.value;
                    return (
                      <button
                        key={q.label}
                        type="button"
                        onClick={() => setDate(q.value)}
                        aria-pressed={active}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer ${
                          active
                            ? "border-teal bg-teal/15 text-teal"
                            : "border-line bg-bg-panel2 text-ink-muted hover:text-ink"
                        }`}
                      >
                        {q.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="note" className="text-sm font-medium text-ink-muted">
                  Note <span className="text-ink-muted/60">(optional)</span>
                </label>
                <input
                  id="note"
                  name="note"
                  type="text"
                  maxLength={120}
                  defaultValue={initial?.note ?? ""}
                  placeholder="e.g. Lunch with team"
                  className="rounded-xl bg-bg-panel border border-line px-4 py-3 focus:border-teal"
                />
              </div>
              </div>

              <div
                className="flex-none border-t border-line bg-bg-soft px-5 pt-3"
                style={{
                  paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
                }}
              >
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-xl bg-teal px-4 py-3.5 font-semibold text-bg shadow-glow transition-colors duration-200 hover:bg-teal-dark disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {pending
                    ? "Saving…"
                    : isEdit
                      ? "Save changes"
                      : "Add transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
