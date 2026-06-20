"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Category, TransactionView } from "@/lib/types";
import { Card, SectionTitle } from "@/components/Card";
import { Amount } from "@/components/Amount";
import { DonutChart, type DonutSegment } from "@/components/DonutChart";
import { EmptyState } from "@/components/EmptyState";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChartIcon,
  ChevronRightIcon,
  CopyIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/icons";
import {
  bangkokYearMonth,
  formatMoney,
  HISTORY_START_ABS,
  MONTHS_SHORT as SHORT,
  todayISO,
} from "@/lib/format";
import { computeForecast } from "@/lib/forecast";
import { CloseIcon } from "@/components/icons";
import { useI18n } from "@/components/LanguageProvider";
import { copyText } from "@/lib/clipboard";

// Plain-language explainer for the forecast, shown in the "?" sheet.
const FORECAST_HELP = {
  en: {
    title: "How the forecast works",
    intro:
      "An estimate of what you're likely to spend next — built from your own history, not a guarantee.",
    items: [
      [
        "Recent months count most",
        "We average your last few months and weight the most recent ones more, so it follows your current pace.",
      ],
      [
        "Same month last year",
        "If there's data from a year ago, we factor in seasonality — e.g. higher spending in December.",
      ],
      [
        "The range (฿low–฿high)",
        "Spending varies month to month, so we show a likely range instead of one exact number.",
      ],
      [
        "Confidence",
        "More months of data → higher confidence. With only a month or two it stays “low”, so don't over-trust it yet.",
      ],
      [
        "By category",
        "Each category is projected the same way; the headline total is their sum.",
      ],
    ],
    note: "“≈” means it's an estimate, not an exact figure.",
  },
  th: {
    title: "Forecast คำนวณยังไง",
    intro:
      "เป็นการประมาณว่าเดือนหน้าน่าจะใช้เท่าไร คิดจากประวัติของคุณเอง ไม่ใช่ตัวเลขรับประกัน",
    items: [
      [
        "เดือนล่าสุดสำคัญสุด",
        "เฉลี่ยจากไม่กี่เดือนล่าสุด โดยถ่วงน้ำหนักเดือนที่ใกล้ปัจจุบันมากกว่า ตัวเลขเลยขยับตามพฤติกรรมล่าสุดของคุณ",
      ],
      [
        "เทียบเดือนเดียวกันปีก่อน",
        "ถ้ามีข้อมูลปีที่แล้ว จะนำ seasonality มาคิดด้วย เช่น ธันวาคมมักใช้จ่ายเยอะ",
      ],
      [
        "ช่วงตัวเลข (฿น้อย–฿มาก)",
        "แต่ละเดือนใช้ไม่เท่ากัน เลยแสดงเป็นช่วงที่น่าจะเป็น ไม่ใช่เลขเป๊ะเลขเดียว",
      ],
      [
        "ความเชื่อมั่น (confidence)",
        "มีข้อมูลหลายเดือน = เชื่อมั่นสูงขึ้น ถ้ามีแค่ 1–2 เดือนจะขึ้น “low” อย่าเพิ่งเชื่อมาก",
      ],
      [
        "รายหมวด",
        "แต่ละหมวดคำนวณแบบเดียวกัน ยอดรวมด้านบนคือผลรวมของทุกหมวด",
      ],
    ],
    note: "“≈” แปลว่าเป็นค่าประมาณ ไม่ใช่ตัวเลขตายตัว",
  },
} as const;

/** Days from a..b inclusive (both YYYY-MM-DD). */
function daysInclusive(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const ms = Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad);
  return Math.floor(ms / 86_400_000) + 1;
}

type Selection = "overview" | number; // number = month offset (0 = current)

interface CatComparison {
  key: string;
  label: string;
  color: string;
  cur: number; // selected-month spend
  base: number; // per-category baseline (avg over the period)
}

interface Period {
  id: string;
  label: string;
  n: number; // months averaged
  base: number; // total baseline expense
  detail: CatComparison[];
}

export function InsightsClient({
  transactions,
  categories = [],
  balance,
  currency,
  initialOffset = 0,
}: {
  transactions: TransactionView[];
  categories?: Category[];
  balance: number;
  currency: string;
  initialOffset?: number;
}) {
  const { lang, t } = useI18n();
  const { year: baseYear, month: baseMonth } = bangkokYearMonth();
  const [selected, setSelected] = useState<Selection>(initialOffset);
  const [catHorizon, setCatHorizon] = useState<1 | 3>(1); // forecast: 1m or 3m
  const [showForecastInfo, setShowForecastInfo] = useState(false);
  const [coachCopied, setCoachCopied] = useState(false);

  useEffect(() => {
    if (!showForecastInfo) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showForecastInfo]);

  // Scroll the active chip into view (e.g. when arriving from Home for an
  // older month, or for any selection change).
  const chipsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = chipsRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>('[data-active="true"]');
    if (el) {
      root.scrollTo({
        left: el.offsetLeft - root.clientWidth / 2 + el.clientWidth / 2,
        behavior: "smooth",
      });
    }
  }, [selected]);

  const isOverview = selected === "overview";
  const offset = isOverview ? 0 : (selected as number);
  const view = new Date(baseYear, baseMonth + offset, 1);
  const vYear = view.getFullYear();
  const vMonth = view.getMonth();

  // Month chips, newest first, back to the earliest transaction (min 12).
  const months = useMemo(() => {
    const current = baseYear * 12 + baseMonth;
    // Always span from Jan 2025; expand further back only if older data exists.
    let earliest = Math.min(HISTORY_START_ABS, current);
    for (const t of transactions) {
      const [y, m] = t.occurred_on.split("-").map(Number);
      const abs = y * 12 + (m - 1);
      if (abs < earliest) earliest = abs;
    }
    const arr: { offset: number; year: number; month: number }[] = [];
    for (let a = current; a >= earliest; a--) {
      arr.push({
        offset: a - current,
        year: Math.floor(a / 12),
        month: ((a % 12) + 12) % 12,
      });
    }
    return arr;
  }, [transactions, baseYear, baseMonth]);

  const analytics = useMemo(() => {
    let income = 0;
    let expense = 0;
    const byCat = new Map<string, DonutSegment>();
    const pastExp: number[] = new Array(12).fill(0); // 0 = last month … 11 = 12 mo ago
    const pastByCat = new Map<string, number[]>(); // key -> spend per past month
    const catMeta = new Map<string, { label: string; color: string }>();
    let earliestDate: string | null = null;

    const metaOf = (t: TransactionView) => {
      const key = t.category?.id ?? "uncat";
      if (!catMeta.has(key))
        catMeta.set(key, {
          label: t.category?.name ?? "Uncategorized",
          color: t.category?.color ?? "#98989f",
        });
      return key;
    };

    const addCurCat = (t: TransactionView, amt: number) => {
      const key = metaOf(t);
      const m = catMeta.get(key)!;
      const cur = byCat.get(key);
      if (cur) cur.value += amt;
      else byCat.set(key, { label: m.label, color: m.color, value: amt });
    };

    for (const t of transactions) {
      const amt = Number(t.amount);

      if (isOverview) {
        if (earliestDate === null || t.occurred_on < earliestDate)
          earliestDate = t.occurred_on;
        if (t.type === "income") income += amt;
        else {
          expense += amt;
          addCurCat(t, amt);
        }
        continue;
      }

      const [ty, tm] = t.occurred_on.split("-").map(Number);
      const monthDiff = (ty - vYear) * 12 + (tm - 1 - vMonth);
      if (monthDiff === 0) {
        if (t.type === "income") income += amt;
        else {
          expense += amt;
          addCurCat(t, amt);
        }
      } else if (monthDiff < 0 && monthDiff >= -12) {
        const idx = -monthDiff - 1;
        if (t.type === "expense") {
          pastExp[idx] += amt;
          const key = metaOf(t);
          let arr = pastByCat.get(key);
          if (!arr) {
            arr = new Array(12).fill(0);
            pastByCat.set(key, arr);
          }
          arr[idx] += amt;
        }
      }
    }

    const segments = [...byCat.values()].sort((a, b) => b.value - a.value);
    const avgN = (n: number) => {
      let sum = 0;
      for (let i = 0; i < n; i++) sum += pastExp[i];
      return sum / n;
    };

    // Per-category breakdown comparing the selected month against an
    // N-month average for each category.
    const buildDetail = (n: number): CatComparison[] => {
      const keys = new Set([...byCat.keys(), ...pastByCat.keys()]);
      const rows: CatComparison[] = [];
      for (const key of keys) {
        const cur = byCat.get(key)?.value ?? 0;
        const arr = pastByCat.get(key);
        let base = 0;
        if (arr) {
          for (let i = 0; i < n; i++) base += arr[i];
          base /= n;
        }
        if (cur === 0 && base === 0) continue;
        const m = catMeta.get(key) ?? {
          label: "Uncategorized",
          color: "#98989f",
        };
        rows.push({ key, label: m.label, color: m.color, cur, base });
      }
      rows.sort((a, b) => Math.max(b.cur, b.base) - Math.max(a.cur, a.base));
      return rows;
    };

    const periods: Period[] = [
      { id: "last", label: "vs last month", n: 1 },
      { id: "3", label: "vs 3-month avg", n: 3 },
      { id: "6", label: "vs 6-month avg", n: 6 },
      { id: "12", label: "vs 12-month avg", n: 12 },
    ].map((p) => ({
      ...p,
      base: avgN(p.n),
      detail: buildDetail(p.n),
    }));

    return { income, expense, segments, earliestDate, periods };
  }, [transactions, isOverview, vYear, vMonth]);

  const { income, expense, segments, earliestDate, periods } = analytics;

  // Average per day
  const today = todayISO();
  const { year: curYear, month: curMonth } = bangkokYearMonth();
  let daysElapsed: number;
  if (isOverview) {
    daysElapsed = earliestDate ? daysInclusive(earliestDate, today) : 1;
  } else {
    const isCurrentMonth = vYear === curYear && vMonth === curMonth;
    daysElapsed = isCurrentMonth
      ? Number(today.split("-")[2])
      : new Date(vYear, vMonth + 1, 0).getDate();
  }
  const avgPerDay = daysElapsed > 0 ? expense / daysElapsed : 0;
  const isCurrentMonth = !isOverview && vYear === curYear && vMonth === curMonth;

  // Smarter forecast — recency-weighted trend blended with year-over-year
  // seasonality, with a confidence/range so sparse data isn't shown as precise.
  // Independent of the selected month (always looks forward from "now").
  const forecast = useMemo(
    () =>
      computeForecast(
        transactions,
        curYear,
        curMonth,
        categories.filter((c) => c.type === "expense")
      ),
    [transactions, categories, curYear, curMonth]
  );

  const periodLabel = isOverview
    ? "All time"
    : `${SHORT[vMonth]} ${vYear}`;
  const hasData = expense > 0 || income > 0;

  // Account health — an at-a-glance read on the selected period plus a couple
  // of recommended actions, all derived from the user's own numbers.
  const health = useMemo(() => {
    type Tone = "good" | "watch" | "bad";
    const signals: { label: string; value: string; tone: Tone }[] = [];

    // 1) Savings rate
    const savingsRate = income > 0 ? (income - expense) / income : null;
    if (savingsRate === null) {
      signals.push({ label: t("ins.sig.savings"), value: t("ins.val.noIncome"), tone: "watch" });
    } else {
      const pct = Math.round(savingsRate * 100);
      signals.push({
        label: t("ins.sig.savings"),
        value:
          pct >= 0
            ? t("ins.val.saving", { pct })
            : t("ins.val.overspending", { pct: Math.abs(pct) }),
        tone: pct >= 20 ? "good" : pct >= 0 ? "watch" : "bad",
      });
    }

    // 2) Spending trend (forward-looking, from the forecast)
    if (forecast) {
      signals.push({
        label: t("ins.sig.trend"),
        value:
          forecast.trend === "rising"
            ? t("ins.val.trendUp")
            : forecast.trend === "falling"
              ? t("ins.val.trendDown")
              : t("ins.val.steady"),
        tone: forecast.trend === "rising" ? "watch" : "good",
      });
    } else {
      signals.push({ label: t("ins.sig.trend"), value: t("ins.val.notEnough"), tone: "watch" });
    }

    // 3) Top-category concentration
    const top = segments[0];
    const topShare = top && expense > 0 ? top.value / expense : 0;
    if (top && expense > 0) {
      signals.push({
        label: t("ins.sig.topCat"),
        value: `${top.label} · ${Math.round(topShare * 100)}%`,
        tone: topShare >= 0.5 ? "watch" : "good",
      });
    }

    const bad = signals.filter((s) => s.tone === "bad").length;
    const watch = signals.filter((s) => s.tone === "watch").length;
    const status: "healthy" | "watch" | "attention" =
      bad > 0 ? "attention" : watch >= 1 ? "watch" : "healthy";
    const summary = t(`ins.summary.${status}`);

    // Recommended actions — highest-impact first, capped at three.
    const actions: string[] = [];
    if (savingsRate !== null && savingsRate < 0) {
      actions.push(
        t("ins.act.overspend", { amt: formatMoney(expense - income, currency) })
      );
    }
    if (forecast && forecast.trend === "rising") {
      actions.push(
        t("ins.act.rising", { amt: formatMoney(forecast.monthly, currency) })
      );
    }
    if (top && topShare >= 0.4) {
      actions.push(
        t("ins.act.concentration", {
          label: top.label,
          pct: Math.round(topShare * 100),
        })
      );
    }
    if (savingsRate !== null && savingsRate >= 0.2) {
      actions.push(t("ins.act.saver", { pct: Math.round(savingsRate * 100) }));
    }
    if (actions.length === 0) {
      actions.push(t("ins.act.onTrack"));
    }

    return { status, summary, signals, actions: actions.slice(0, 3) };
  }, [income, expense, segments, forecast, currency, t]);

  const STATUS_META = {
    healthy: { text: "text-pos", bg: "bg-pos/15" },
    watch: { text: "text-warn", bg: "bg-warn/15" },
    attention: { text: "text-neg", bg: "bg-neg/15" },
  } as const;
  const toneClass = (tn: "good" | "watch" | "bad") =>
    tn === "good" ? "text-pos" : tn === "bad" ? "text-neg" : "text-warn";

  // Recent monthly trend on the REAL calendar (independent of the selected
  // chip): this month, last month, and the trailing 3-month average.
  const coachTimeView = useMemo(() => {
    const curAbs = curYear * 12 + curMonth;
    const exp = [0, 0, 0, 0]; // 0 = this month … 3 = three months ago
    const inc = [0, 0, 0, 0];
    for (const t of transactions) {
      const [ty, tm] = t.occurred_on.split("-").map(Number);
      const off = curAbs - (ty * 12 + (tm - 1));
      if (off < 0 || off > 3) continue;
      const amt = Number(t.amount);
      if (t.type === "income") inc[off] += amt;
      else exp[off] += amt;
    }
    const label = (off: number) => {
      const d = new Date(curYear, curMonth - off, 1);
      return `${SHORT[d.getMonth()]} ${d.getFullYear()}`;
    };
    return {
      exp,
      inc,
      expAvg3: (exp[1] + exp[2] + exp[3]) / 3,
      incAvg3: (inc[1] + inc[2] + inc[3]) / 3,
      label,
    };
  }, [transactions, curYear, curMonth]);

  // A ready-to-paste coaching prompt with the user's own numbers baked in.
  const coachPrompt = useMemo(() => {
    const lines: string[] = [];
    lines.push(
      "You are my personal finance coach. Analyze my money and give me a short, practical plan."
    );
    lines.push("");
    lines.push(`Currency: ${currency}. Period: ${periodLabel}.`);
    lines.push("");
    lines.push("MY NUMBERS");
    lines.push(`- Income: ${formatMoney(income, currency)}`);
    lines.push(`- Expenses: ${formatMoney(expense, currency)}`);
    const net = income - expense;
    const sr = income > 0 ? Math.round((net / income) * 100) : null;
    lines.push(
      `- Net this period: ${net >= 0 ? "+" : ""}${formatMoney(net, currency)}${
        sr !== null ? ` (savings rate ${sr}%)` : ""
      }`
    );
    lines.push(`- Total balance now: ${formatMoney(balance, currency)}`);
    lines.push(`- Average spend per day: ${formatMoney(avgPerDay, currency)}`);

    const tv = coachTimeView;
    lines.push("");
    lines.push("RECENT MONTHLY TREND (actual calendar months)");
    lines.push(
      `- This month (${tv.label(0)}, so far): income ${formatMoney(tv.inc[0], currency)}, expense ${formatMoney(tv.exp[0], currency)}`
    );
    lines.push(
      `- Last month (${tv.label(1)}): income ${formatMoney(tv.inc[1], currency)}, expense ${formatMoney(tv.exp[1], currency)}`
    );
    lines.push(
      `- Trailing 3-month average (${tv.label(3)} – ${tv.label(1)}): expense ${formatMoney(tv.expAvg3, currency)}, income ${formatMoney(tv.incAvg3, currency)}`
    );

    if (segments.length > 0) {
      lines.push("");
      lines.push("TOP SPENDING CATEGORIES");
      for (const s of segments.slice(0, 6)) {
        const share = expense > 0 ? Math.round((s.value / expense) * 100) : 0;
        lines.push(`- ${s.label}: ${formatMoney(s.value, currency)} (${share}%)`);
      }
    }

    if (forecast) {
      lines.push("");
      lines.push("TREND & FORECAST");
      lines.push(
        `- Spending trend: ${
          forecast.trend === "rising"
            ? "trending up"
            : forecast.trend === "falling"
              ? "trending down"
              : "steady"
        }`
      );
      const range =
        forecast.low != null && forecast.high != null
          ? ` (range ${formatMoney(forecast.low, currency)}–${formatMoney(forecast.high, currency)})`
          : "";
      lines.push(
        `- Next month projected: ~${formatMoney(forecast.monthly, currency)}${range}, ${forecast.confidence} confidence from ${forecast.basisMonths} months of data`
      );
      lines.push(`- Next 3 months: ~${formatMoney(forecast.next3, currency)}`);
    }

    if (!isOverview) {
      const withBase = periods.filter((p) => p.base > 0);
      if (withBase.length > 0) {
        lines.push("");
        lines.push("HOW THIS MONTH COMPARES");
        for (const p of withBase) {
          const diff = expense - p.base;
          const pct = Math.round((Math.abs(diff) / p.base) * 100);
          lines.push(
            `- ${p.label}: ${diff >= 0 ? "+" : "-"}${pct}% (avg ${formatMoney(p.base, currency)})`
          );
        }
      }
    }

    lines.push("");
    lines.push("PLEASE");
    lines.push("1. In 2-3 sentences, tell me how I'm doing.");
    lines.push("2. Call out my single biggest risk and biggest win.");
    lines.push("3. Give me 3 specific actions for next month, each with a target number.");
    lines.push("4. Suggest a realistic monthly budget for my top categories.");
    lines.push(
      "Keep it under 250 words, friendly and direct. Reply in Thai if I message you in Thai."
    );
    return lines.join("\n");
  }, [
    currency,
    periodLabel,
    income,
    expense,
    balance,
    avgPerDay,
    segments,
    forecast,
    isOverview,
    periods,
    coachTimeView,
  ]);

  async function copyCoachPrompt() {
    const ok = await copyText(coachPrompt);
    if (ok) {
      setCoachCopied(true);
      setTimeout(() => setCoachCopied(false), 2000);
    }
  }

  return (
    <>
      {/* Header + simple period picker */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg-soft/80 backdrop-blur-lg pt-safe">
        <div className="mx-auto max-w-2xl px-5 pt-3.5 pb-2.5 flex items-baseline justify-between">
          <h1 className="text-xl font-bold tracking-tight">{t("ins.title")}</h1>
          <p className="text-sm font-medium tabular-nums text-ink-muted">
            {isOverview ? t("ins.allTime") : periodLabel}
          </p>
        </div>
        <div className="mx-auto max-w-2xl pb-3">
          <div
            ref={chipsRef}
            className="no-scrollbar flex gap-2 overflow-x-auto px-5"
          >
            <Chip active={isOverview} onClick={() => setSelected("overview")}>
              {t("ins.overview")}
            </Chip>
            {months.map((m) => (
              <Chip
                key={m.offset}
                active={!isOverview && selected === m.offset}
                onClick={() => setSelected(m.offset)}
              >
                {SHORT[m.month]} {String(m.year).slice(2)}
              </Chip>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 pt-5 pb-8 flex flex-col gap-5">
        {/* Balance + totals for the selected period */}
        <Card className="p-5 bg-gradient-to-br from-bg-panel to-bg-panel2">
          <p className="text-sm text-ink-muted">{t("ins.totalBalance")}</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">
            <Amount value={balance} currency={currency} />
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-bg-soft/60 px-3 py-2.5">
              <p className="text-[11px] text-ink-muted flex items-center gap-1">
                <ArrowUpIcon className="w-3.5 h-3.5 text-pos" />
                {t("common.income")}
              </p>
              <p className="mt-0.5 text-sm font-semibold">
                <Amount value={income} currency={currency} type="income" />
              </p>
            </div>
            <div className="rounded-xl bg-bg-soft/60 px-3 py-2.5">
              <p className="text-[11px] text-ink-muted flex items-center gap-1">
                <ArrowDownIcon className="w-3.5 h-3.5 text-neg" />
                {t("common.expense")}
              </p>
              <p className="mt-0.5 text-sm font-semibold">
                <Amount value={expense} currency={currency} type="expense" />
              </p>
            </div>
            <div className="rounded-xl bg-bg-soft/60 px-3 py-2.5">
              <p className="text-[11px] text-ink-muted">{t("common.net")}</p>
              <p className="mt-0.5 text-sm font-semibold">
                <Amount value={income - expense} currency={currency} signed />
              </p>
            </div>
          </div>
        </Card>

        {!hasData ? (
          <Card>
            <EmptyState
              icon={<ChartIcon className="w-6 h-6" />}
              title={isOverview ? t("ins.empty.noTx") : t("ins.empty.noMonth")}
              description={t("ins.empty.desc")}
            />
          </Card>
        ) : (
          <>
            {/* Account status + recommended actions */}
            <section>
              <SectionTitle>{t("ins.accountStatus")}</SectionTitle>
              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-10 w-10 flex-none place-items-center rounded-full ${STATUS_META[health.status].bg}`}
                    >
                      <ShieldIcon
                        className={`h-5 w-5 ${STATUS_META[health.status].text}`}
                      />
                    </span>
                    <p className="text-sm text-ink-muted">{health.summary}</p>
                  </div>
                  <span
                    className={`flex-none rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_META[health.status].bg} ${STATUS_META[health.status].text}`}
                  >
                    {t(`ins.status.${health.status}`)}
                  </span>
                </div>

                <div className="mt-4 flex flex-col divide-y divide-line/60">
                  {health.signals.map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <span className="text-sm text-ink-muted">{s.label}</span>
                      <span
                        className={`text-sm font-semibold tabular-nums ${toneClass(s.tone)}`}
                      >
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-line pt-3">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    <SparkIcon className="h-3.5 w-3.5 text-teal" />
                    {t("ins.recommended")}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {health.actions.map((a, i) => (
                      <li
                        key={i}
                        className="flex gap-2.5 text-sm leading-snug text-ink"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-teal" />
                        <span className="min-w-0">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </section>

            {/* AI Coach — export a stats-filled prompt for any LLM */}
            <section>
              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-teal/15">
                    <SparkIcon className="h-5 w-5 text-teal" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{t("ins.coach")}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                      {t("ins.coachDesc")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyCoachPrompt}
                  className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-bg shadow-glow transition-colors duration-200 hover:bg-teal-dark cursor-pointer"
                >
                  <CopyIcon className="h-4 w-4" />
                  {coachCopied ? t("ins.copied") : t("ins.coachCopy")}
                </button>
              </Card>
            </section>

            {/* Spending */}
            <section>
              <SectionTitle>
                {isOverview ? t("ins.totalSpending") : t("ins.spendingMonth")}
              </SectionTitle>
              <Card className="p-5">
                <p className="text-3xl font-bold tabular-nums text-neg">
                  {formatMoney(expense, currency)}
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  {t("ins.avg")}{" "}
                  <span className="font-semibold text-ink">
                    {formatMoney(avgPerDay, currency)}
                  </span>{" "}
                  / {t("ins.day")}
                  {isCurrentMonth ? ` ${t("ins.soFar")}` : ""}
                </p>
              </Card>
            </section>

            {/* Comparison — only meaningful for a single month. Tap a row to
                drill into the per-category breakdown. */}
            {!isOverview && (
              <section>
                <SectionTitle>{t("ins.comparison")}</SectionTitle>
                <Card className="divide-y divide-line overflow-hidden">
                  {periods.map((p) => (
                    <CompRow
                      key={p.id}
                      label={t(p.id === "last" ? "ins.vsLast" : `ins.vs${p.id}`)}
                      base={p.base}
                      current={expense}
                      currency={currency}
                      detail={p.detail}
                    />
                  ))}
                </Card>
                <p className="mt-1.5 px-1 text-[11px] text-ink-muted/70">
                  {t("ins.tapRow")}
                </p>
              </section>
            )}

            {/* By category */}
            {segments.length > 0 && (
              <section>
                <SectionTitle>{t("ins.byCategory")}</SectionTitle>
                <Card className="p-5">
                  <DonutChart segments={segments} currency={currency} />
                </Card>
              </section>
            )}
          </>
        )}

        {/* Forecast — forward-looking, shown regardless of the selected month */}
        {forecast ? (
          <section>
            <SectionTitle
              action={
                <button
                  type="button"
                  onClick={() => setShowForecastInfo(true)}
                  aria-label={FORECAST_HELP[lang].title}
                  className="grid h-5 w-5 place-items-center rounded-full border border-line text-xs font-bold text-ink-muted transition-colors duration-200 hover:border-ink-muted/60 hover:text-ink cursor-pointer"
                >
                  ?
                </button>
              }
            >
              {t("ins.forecast")}
            </SectionTitle>
            <Card className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-bg-soft/50 px-3 py-2.5">
                  <p className="text-[11px] text-ink-muted">
                    {t("ins.nextMonth")} · {forecast.nextLabel}
                  </p>
                  <p className="mt-0.5 whitespace-nowrap text-xl font-bold tabular-nums">
                    <span className="font-normal text-ink-muted">≈</span>{" "}
                    {formatMoney(forecast.monthly, currency)}
                  </p>
                  {forecast.low != null && forecast.high != null ? (
                    <p className="text-[11px] tabular-nums text-ink-muted/70">
                      {formatMoney(forecast.low, currency)} –{" "}
                      {formatMoney(forecast.high, currency)}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-xl bg-bg-soft/50 px-3 py-2.5">
                  <p className="text-[11px] text-ink-muted">{t("ins.next3")}</p>
                  <p className="mt-0.5 whitespace-nowrap text-xl font-bold tabular-nums">
                    <span className="font-normal text-ink-muted">≈</span>{" "}
                    {formatMoney(forecast.next3, currency)}
                  </p>
                </div>
              </div>

              {/* trend · confidence · seasonality */}
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                {forecast.trend === "steady" ? (
                  <span className="text-ink-muted">{t("ins.val.steady")}</span>
                ) : (
                  <span
                    className={`flex items-center gap-0.5 font-medium ${
                      forecast.trend === "rising" ? "text-neg" : "text-pos"
                    }`}
                  >
                    {forecast.trend === "rising" ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3" />
                    )}
                    {forecast.trend === "rising"
                      ? t("ins.val.trendUp")
                      : t("ins.val.trendDown")}
                  </span>
                )}
                <span className="text-ink-muted">
                  {t(`ins.conf.${forecast.confidence}`)} {t("ins.confidence")} ·{" "}
                  {forecast.basisMonths} {t("ins.mo")}
                </span>
                {forecast.seasonalUsed ? (
                  <span className="text-teal-light">{t("ins.seasonal")}</span>
                ) : null}
              </div>

              {forecast.perCat.length > 0 ? (
                <div className="mt-4 border-t border-line pt-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      {t("ins.projectedByCat")}
                    </p>
                    <div className="flex gap-1 rounded-lg bg-bg-panel2 p-0.5">
                      {([1, 3] as const).map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setCatHorizon(h)}
                          aria-pressed={catHorizon === h}
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold tabular-nums transition-colors duration-200 cursor-pointer ${
                            catHorizon === h
                              ? "bg-teal text-bg"
                              : "text-ink-muted hover:text-ink"
                          }`}
                        >
                          {h}m
                        </button>
                      ))}
                    </div>
                  </div>
                  <ul className="flex flex-col divide-y divide-line/50">
                    {forecast.perCat.map((c, i) => (
                      <li
                        key={`${c.key}-${i}`}
                        className="flex items-center gap-2 py-1.5"
                      >
                        <span
                          className="h-2.5 w-2.5 flex-none rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="min-w-0 flex-1 truncate text-sm text-ink">
                          {c.label}
                        </span>
                        <span className="tabular-nums text-sm text-ink">
                          {formatMoney(
                            catHorizon === 1 ? c.monthly : c.quarter,
                            currency
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Card>
          </section>
        ) : null}
      </div>

      {showForecastInfo ? (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={FORECAST_HELP[lang].title}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowForecastInfo(false)}
          />
          <div className="relative flex w-full flex-col sm:max-w-md bg-bg-soft border-t sm:border border-line sm:rounded-2xl rounded-t-2xl shadow-card max-h-[88dvh] overflow-hidden">
            <div className="flex flex-none items-center justify-between px-5 py-4 border-b border-line">
              <h2 className="text-lg font-bold">
                {FORECAST_HELP[lang].title}
              </h2>
              <button
                onClick={() => setShowForecastInfo(false)}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted hover:text-ink hover:bg-bg-panel transition-colors duration-200 cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div
              className="flex flex-col gap-4 overflow-y-auto px-5 py-5"
              style={{
                paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
              }}
            >
              <p className="text-sm text-ink-muted">
                {FORECAST_HELP[lang].intro}
              </p>
              <ul className="flex flex-col gap-3">
                {FORECAST_HELP[lang].items.map(([term, desc]) => (
                  <li key={term} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-teal" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{term}</p>
                      <p className="text-sm text-ink-muted">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="rounded-xl bg-bg-panel px-3 py-2.5 text-xs text-ink-muted">
                {FORECAST_HELP[lang].note}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-active={active}
      className={`flex-none whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium tabular-nums transition-colors duration-200 cursor-pointer ${
        active
          ? "bg-teal text-bg"
          : "bg-bg-panel text-ink-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function CompRow({
  label,
  base,
  current,
  currency,
  detail,
}: {
  label: string;
  base: number;
  current: number;
  currency: string;
  detail: CatComparison[];
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  if (base === 0) {
    return (
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm text-ink-muted">{label}</span>
        <span className="text-xs text-ink-muted/60">{t("ins.noData")}</span>
      </div>
    );
  }

  const diff = current - base;
  const pct = Math.round((Math.abs(diff) / base) * 100);
  const up = diff > 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors duration-200 hover:bg-bg-panel2/40 cursor-pointer"
      >
        <span className="flex items-center gap-1.5 text-sm text-ink-muted">
          <ChevronRightIcon
            className={`w-4 h-4 transition-transform duration-200 ${
              open ? "rotate-90" : ""
            }`}
          />
          {label}
        </span>
        <span className="flex items-center gap-3">
          <span className="text-xs text-ink-muted">
            {t("ins.avgWord")} {formatMoney(base, currency)}
          </span>
          <span
            className={`flex items-center gap-0.5 text-sm font-semibold ${
              up ? "text-neg" : "text-pos"
            }`}
          >
            {up ? (
              <ArrowUpIcon className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownIcon className="w-3.5 h-3.5" />
            )}
            {pct}%
          </span>
        </span>
      </button>

      {open ? (
        <div className="bg-bg-soft/40 px-4 pb-2.5 pt-0.5">
          {detail.length === 0 ? (
            <p className="py-2 text-xs text-ink-muted">{t("ins.noCatBreakdown")}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line/50">
              {detail.map((d) => (
                <CompDetailRow key={d.key} d={d} currency={currency} />
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function CompDetailRow({
  d,
  currency,
}: {
  d: CatComparison;
  currency: string;
}) {
  const { t } = useI18n();
  const { label, color, cur, base } = d;

  let badge: React.ReactNode;
  if (base === 0) {
    badge = <span className="text-xs font-semibold text-teal">{t("ins.new")}</span>;
  } else {
    const diff = cur - base;
    const pct = Math.round((Math.abs(diff) / base) * 100);
    const up = diff > 0;
    badge = (
      <span
        className={`flex items-center justify-end gap-0.5 text-xs font-semibold ${
          up ? "text-neg" : "text-pos"
        }`}
      >
        {up ? (
          <ArrowUpIcon className="w-3 h-3" />
        ) : (
          <ArrowDownIcon className="w-3 h-3" />
        )}
        {pct}%
      </span>
    );
  }

  return (
    <li className="flex items-center gap-2 py-2">
      <span
        className="h-2.5 w-2.5 flex-none rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="min-w-0 flex-1 truncate text-sm text-ink">{label}</span>
      <span
        className="tabular-nums text-sm text-ink"
        title={`avg ${formatMoney(base, currency)}`}
      >
        {formatMoney(cur, currency)}
      </span>
      <span className="w-14 flex-none">{badge}</span>
    </li>
  );
}
