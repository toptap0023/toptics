/** The app is single-currency: Thai Baht, whole numbers, Asia/Bangkok time. */
export const CURRENCY = "THB";
export const TIME_ZONE = "Asia/Bangkok";

/** Earliest month shown in month pickers: January 2025 (month is 0-based). */
export const HISTORY_START_YEAR = 2025;
export const HISTORY_START_MONTH = 0;
/** Absolute month index (year*12 + monthIndex) of the history start. */
export const HISTORY_START_ABS = HISTORY_START_YEAR * 12 + HISTORY_START_MONTH;

// Intl formatter construction is expensive and formatMoney runs in hot render
// loops (chart bars, list rows, prompt building) — cache one per currency.
const moneyFmtCache = new Map<string, Intl.NumberFormat>();
function moneyFmt(currency: string): Intl.NumberFormat {
  let f = moneyFmtCache.get(currency);
  if (!f) {
    f = new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    moneyFmtCache.set(currency, f);
  }
  return f;
}

export function formatMoney(
  amount: number,
  currency = CURRENCY,
  opts: { sign?: boolean } = {}
): string {
  const abs = Math.round(Math.abs(amount));
  let formatted: string;
  try {
    formatted = moneyFmt(currency).format(abs);
  } catch {
    formatted = `฿${abs}`;
  }
  if (opts.sign) {
    return `${amount < 0 ? "−" : "+"}${formatted}`;
  }
  return amount < 0 ? `−${formatted}` : formatted;
}

/** Short month names, indexed 0–11 (Jan–Dec). Shared across the app. */
export const MONTHS_SHORT = [
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

/** Parse a YYYY-MM-DD date string as a local date (no timezone shift). */
export function parseDate(d: string): Date {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, day ?? 1);
}

export function formatDate(d: string): string {
  const date = parseDate(d);
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** "today" | "yesterday" for relative day-group headers, else null —
 *  the caller translates the token (i18n lives in components, not here). */
export function dateGroupKey(d: string): "today" | "yesterday" | null {
  const date = parseDate(d);
  const today = new Date();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(date, today)) return "today";
  if (isSameDay(date, yesterday)) return "yesterday";
  return null;
}

export function monthLabel(d: Date): string {
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/** Today's date in Asia/Bangkok as YYYY-MM-DD (independent of server/device TZ). */
// en-CA formats as YYYY-MM-DD; cached — DateTimeFormat construction is costly
// and todayISO runs on every render of several components.
const isoDayFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function todayISO(): string {
  return isoDayFmt.format(new Date());
}

/** The current year + 0-based month in Asia/Bangkok. */
export function bangkokYearMonth(): { year: number; month: number } {
  const [y, m] = todayISO().split("-").map(Number);
  return { year: y, month: m - 1 };
}

/** First/last day of a given month as YYYY-MM-DD. */
export function monthBounds(year: number, monthIndex: number) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = `${year}-${pad(monthIndex + 1)}-01`;
  const last = new Date(year, monthIndex + 1, 0).getDate();
  const end = `${year}-${pad(monthIndex + 1)}-${pad(last)}`;
  return { start, end };
}
