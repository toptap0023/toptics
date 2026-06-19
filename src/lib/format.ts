/** The app is single-currency: Thai Baht, whole numbers, Asia/Bangkok time. */
export const CURRENCY = "THB";
export const TIME_ZONE = "Asia/Bangkok";

/** Earliest month shown in month pickers: January 2025 (month is 0-based). */
export const HISTORY_START_YEAR = 2025;
export const HISTORY_START_MONTH = 0;
/** Absolute month index (year*12 + monthIndex) of the history start. */
export const HISTORY_START_ABS = HISTORY_START_YEAR * 12 + HISTORY_START_MONTH;

export function formatMoney(
  amount: number,
  currency = CURRENCY,
  opts: { sign?: boolean } = {}
): string {
  const abs = Math.round(Math.abs(amount));
  let formatted: string;
  try {
    formatted = new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(abs);
  } catch {
    formatted = `฿${abs}`;
  }
  if (opts.sign) {
    return `${amount < 0 ? "−" : "+"}${formatted}`;
  }
  return amount < 0 ? `−${formatted}` : formatted;
}

const MONTHS = [
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
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatDateGroup(d: string): string {
  const date = parseDate(d);
  const today = new Date();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return formatDate(d);
}

export function monthLabel(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Today's date in Asia/Bangkok as YYYY-MM-DD (independent of server/device TZ). */
export function todayISO(): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
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
