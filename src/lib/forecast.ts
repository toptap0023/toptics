import type { TransactionView } from "@/lib/types";
import { isInvestmentTx } from "@/lib/types";
import { MONTHS_SHORT as SHORT } from "@/lib/format";

export interface CatForecast {
  key: string;
  label: string;
  color: string;
  monthly: number; // forecast for the next month
  quarter: number; // forecast for the next 3 months (sum)
}

export interface ForecastResult {
  nextLabel: string; // "Jul 2026"
  monthly: number; // point estimate, next month
  next3: number; // sum of next 3 months
  low: number | null; // range (±1 sd of recent months), null if <2 data months
  high: number | null;
  basisMonths: number; // completed months with data, last 12
  confidence: "low" | "medium" | "high";
  seasonalUsed: boolean; // a year-ago anchor was available
  trend: "rising" | "falling" | "steady";
  perCat: CatForecast[];
}

/**
 * Smarter expense forecast: a recency-weighted level (recent months count more →
 * leans into the trend) blended with a year-over-year seasonal anchor when the
 * same calendar month last year has data. Forecasts each category, sums for the
 * headline, and reports a range + confidence so sparse data isn't shown as if
 * it were precise. Returns null when there is no completed-month history.
 */
export function computeForecast(
  transactions: TransactionView[],
  curYear: number,
  curMonth: number, // 0-based
  expenseCategories: { id: string; name: string; color: string }[] = []
): ForecastResult | null {
  const cur = curYear * 12 + curMonth;

  const monthTotal = new Map<number, number>(); // abs -> total expense
  const catMonth = new Map<string, Map<number, number>>(); // catKey -> abs -> sum
  const meta = new Map<string, { label: string; color: string }>();

  for (const t of transactions) {
    if (t.type !== "expense") continue;
    if (isInvestmentTx(t)) continue; // investments are not living expenses
    const [y, m] = t.occurred_on.split("-").map(Number);
    const abs = y * 12 + (m - 1);
    if (abs >= cur) continue; // completed months only
    const amt = Number(t.amount);
    monthTotal.set(abs, (monthTotal.get(abs) ?? 0) + amt);
    const key = t.category?.id ?? "uncat";
    if (!meta.has(key))
      meta.set(key, {
        label: t.category?.name ?? "Uncategorized",
        color: t.category?.color ?? "#98989f",
      });
    let cm = catMonth.get(key);
    if (!cm) {
      cm = new Map();
      catMonth.set(key, cm);
    }
    cm.set(abs, (cm.get(abs) ?? 0) + amt);
  }

  // Months (within the last 12 completed) that actually have data, newest first.
  const dataMonths = [...monthTotal.keys()]
    .filter((a) => a >= cur - 12 && a < cur)
    .sort((a, b) => b - a);
  if (dataMonths.length === 0) return null;

  const recent = dataMonths.slice(0, 6); // weight the 6 most recent
  const basisMonths = dataMonths.length;

  // recency weights: newest gets the highest weight
  const wsum = recent.reduce((s, _, i) => s + (recent.length - i), 0);
  const catLevel = new Map<string, number>();
  for (const [key, cm] of catMonth) {
    let acc = 0;
    recent.forEach((abs, i) => {
      acc += (recent.length - i) * (cm.get(abs) ?? 0);
    });
    catLevel.set(key, acc / wsum);
  }

  const seasonalAt = (key: string, targetAbs: number) =>
    catMonth.get(key)?.get(targetAbs - 12); // same calendar month, last year

  // Per-category estimate for a target month: blend recency level + seasonal.
  const catForMonth = (key: string, targetAbs: number) => {
    const level = catLevel.get(key) ?? 0;
    const s = seasonalAt(key, targetAbs);
    const est = s == null ? level : 0.55 * level + 0.45 * s;
    return Math.max(0, est);
  };

  const monthForecast = (targetAbs: number) => {
    let sum = 0;
    for (const key of catMonth.keys()) sum += catForMonth(key, targetAbs);
    return sum;
  };

  let seasonalUsed = false;
  for (const dt of [1, 2, 3]) {
    for (const key of catMonth.keys()) {
      if (seasonalAt(key, cur + dt) != null) {
        seasonalUsed = true;
        break;
      }
    }
    if (seasonalUsed) break;
  }

  const monthly = Math.round(monthForecast(cur + 1));
  const next3 = Math.round(
    [1, 2, 3].reduce((s, dt) => s + monthForecast(cur + dt), 0)
  );

  // Show a row for EVERY expense category (even ฿0), plus any history-only
  // keys (e.g. "Uncategorized") that aren't in the category list.
  const rowMeta = new Map<string, { label: string; color: string }>();
  for (const c of expenseCategories)
    rowMeta.set(c.id, { label: c.name, color: c.color });
  for (const [key, m] of meta) if (!rowMeta.has(key)) rowMeta.set(key, m);

  const perCat: CatForecast[] = [...rowMeta.entries()]
    .map(([key, m]) => ({
      key,
      label: m.label,
      color: m.color,
      monthly: Math.round(catForMonth(key, cur + 1)),
      quarter: Math.round(
        [1, 2, 3].reduce((s, dt) => s + catForMonth(key, cur + dt), 0)
      ),
    }))
    .sort((a, b) => b.monthly - a.monthly || a.label.localeCompare(b.label));

  // Range from the spread of recent monthly totals (±1 sd).
  const recentTotals = recent.map((a) => monthTotal.get(a) ?? 0);
  let low: number | null = null;
  let high: number | null = null;
  if (recentTotals.length >= 2) {
    const mean =
      recentTotals.reduce((s, x) => s + x, 0) / recentTotals.length;
    const variance =
      recentTotals.reduce((s, x) => s + (x - mean) ** 2, 0) /
      recentTotals.length;
    const sd = Math.sqrt(variance);
    low = Math.max(0, Math.round(monthly - sd));
    high = Math.round(monthly + sd);
  }

  // Trend: sign of the slope across recent totals (oldest → newest).
  let trend: "rising" | "falling" | "steady" = "steady";
  if (recent.length >= 3) {
    const ys = [...recent].reverse().map((a) => monthTotal.get(a) ?? 0);
    const n = ys.length;
    const mx = (n - 1) / 2;
    const my = ys.reduce((s, y) => s + y, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (i - mx) * (ys[i] - my);
      den += (i - mx) ** 2;
    }
    const slope = den ? num / den : 0;
    const rel = my ? slope / my : 0;
    if (rel > 0.05) trend = "rising";
    else if (rel < -0.05) trend = "falling";
  }

  const confidence: "low" | "medium" | "high" =
    basisMonths >= 6 ? "high" : basisMonths >= 3 ? "medium" : "low";

  const nextAbs = cur + 1;
  const nextLabel = `${SHORT[((nextAbs % 12) + 12) % 12]} ${Math.floor(
    nextAbs / 12
  )}`;

  return {
    nextLabel,
    monthly,
    next3,
    low,
    high,
    basisMonths,
    confidence,
    seasonalUsed,
    trend,
    perCat,
  };
}
