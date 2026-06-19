# TOPtics — Project Reference & Optimization Guide

A mobile-first personal finance tracker. **Next.js 15 (App Router) · React 19 · Supabase · Tailwind v3.**
Dark-first, iPhone-class, **single currency THB**, **Asia/Bangkok**, whole numbers (no decimals), SVG icons only (no emoji).

- **Live:** https://toptics.vercel.app
- **Repo root:** `/Users/iconkaset-top/Downloads/spendee clone`
- **Supabase:** project `vderzhxfenyvpwztedfb`, region `ap-south-1` (Mumbai)
- **Vercel:** project `toptics`, functions pinned to `bom1` (Mumbai) — see [Performance](#7-performance--optimization)

> Note: the old `README.md` describes the original multi-wallet + budgets build and is **stale**. This file is the current source of truth.

---

## 1. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js `^15.5.19` (App Router) | bumped from 15.1.6 (Vercel CVE gate). Stay on 15.x — **do not** jump to 16. |
| UI runtime | React `19.0.0` | |
| Styling | Tailwind v3 + CSS-variable color tokens | `rgb(var(--x) / <alpha-value>)` enables theming with zero component changes |
| Data/Auth | Supabase (`@supabase/ssr`) | cookie auth, RLS, Postgres |
| Hosting | Vercel | function region `bom1` co-located with DB |

---

## 2. Categorized file map

### 2a. App routes (`src/app/`)
| Path | Type | Responsibility |
|---|---|---|
| `layout.tsx` | server | Root shell; no-FOUC theme script; `<Providers>`; metadata |
| `page.tsx` | server | `/` → redirect to `/dashboard` or `/login` |
| `globals.css` | css | Dark `:root` + `.light` channel vars; body uses tokens |
| `manifest.ts` / `icon.svg` | meta | PWA manifest + favicon (T-monogram) |
| `(app)/layout.tsx` | server | Auth-guarded shell + bottom nav |
| `(app)/dashboard/page.tsx` | server `force-dynamic` | **Home** — month picker chart + tx list + FAB |
| `(app)/analytics/page.tsx` | server `force-dynamic` | **Insights** — comparison, drill-down, forecast |
| `(app)/settings/page.tsx` | server `force-dynamic` | **Settings** — groups + sign-out |
| `(app)/preferences/page.tsx` | server | Theme + language picker |
| `(app)/actions.ts` | server actions | All CRUD (see [§4](#4-server-actions)) |
| `login/`, `forgot-password/`, `reset-password/` | mixed | Auth + OTP reset flow |
| `auth/callback/route.ts` | route | `exchangeCodeForSession` + `verifyOtp` |
| `auth/signout/route.ts` | route | Sign out |

### 2b. Components (`src/components/`)
| Category | Files |
|---|---|
| **Shell / nav** | `AppHeader`, `SettingsHeader`, `BottomNav`, `Providers` |
| **Providers (client)** | `ThemeProvider` (system/light/dark, `toptics:theme`), `LanguageProvider` (EN/TH, `toptics:lang`) |
| **Home** | `MonthHome`, `MonthSelectorChart`, `TransactionRow`, `TransactionSheet` |
| **Insights** | `InsightsClient` (chips, drill-down, forecast, help sheet) |
| **Settings** | `Settings`, `Preferences`, `ImportSheet` |
| **Primitives** | `Card`, `Amount`, `DonutChart`, `EmptyState`, `icons` (incl. `BrandMark`) |

### 2c. Lib (`src/lib/`)
| File | Exports | Role |
|---|---|---|
| `queries.ts` | `getWallets`, `getCategories`, `getTransactions(limit)`, `getBalance` | Read layer (server) |
| `format.ts` | `CURRENCY`, `TIME_ZONE`, `HISTORY_START_*`, `formatMoney`, `todayISO`, `bangkokYearMonth`, `monthBounds`, `monthLabel`… | Money/date/TZ helpers |
| `forecast.ts` | `computeForecast(...)` | Recency-weighted + seasonal forecast (pure fn) |
| `i18n.ts` | `Lang`, `dictionaries`, `translate` | EN/TH strings (phase 1: nav + Settings) |
| `types.ts` | `Wallet`, `Category`, `Transaction`, `Budget`, `TransactionView` | Domain types |
| `supabase/{client,server,middleware}.ts` | — | SSR Supabase clients |
| `middleware.ts` (src root) | — | Session refresh + route guard (`PUBLIC_PATHS`) |

---

## 3. Data model (current)

| Table | Purpose | Status |
|---|---|---|
| `wallets` | Single THB wallet (starting balance) | active — locked to one wallet |
| `categories` | Income/expense (`type`, `color`, `icon`, `position`) | active |
| `transactions` | Entries (`amount`, `occurred_on` YYYY-MM-DD, `note`) | active |
| `budgets` | One amount per category | **type exists but feature removed** |

All tables RLS-protected (per-user). `handle_new_user` trigger seeds wallet + default categories.
**Shared Supabase project** also hosts `golf_*` tables for a separate app — **never drop those.**

---

## 4. Server actions

`createTransaction`, `updateTransaction`, `deleteTransaction`, `updateWallet`, `createCategory`,
`deleteCategory`, `importTransactions` (CSV `category,budget,remaining` → append-only, find-or-create categories, `spent = budget − remaining`). Amounts `Math.round`-ed.

---

## 5. Feature inventory

- **Home:** bar chart *is* the month picker (auto-extends monthly, starts Jan 2025); per-month "View Insights" deep-link → `/analytics?ym=YYYY-MM`.
- **Insights:** month chips + Overview (all-time); % comparison vs last / 3 / 6 / 12-mo avg; clickable per-category drill-down; **Forecast** (trend + seasonality + confidence/range, every category row, 1m/3m toggle, "?" help sheet).
- **Add transaction:** Spendee-style icon grid; bottom-fixed CTA; date quick-picks; remembers last date 24h.
- **Import data:** "Copy AI prompt" + bulk multi-month CSV, append-only, auto-create categories.
- **Settings/Preferences:** System/Light/Dark theme; EN/TH language; grouped (Wallet, Categories, Data, Sign out); profile icon → /preferences (Settings page only).
- **Auth:** email/password; **OTP 6-digit** password reset (`verifyOtp` recovery).

---

## 6. Theming & i18n

- **Theme:** `.light` class on `<html>`; default dark; no-FOUC inline script in root layout; persisted `toptics:theme`. Tokens: `bg.soft/panel/panel2`, `line`, `ink`. Accent/semantic (`teal`/`pos`/`neg`) constant hex.
- **i18n:** `LanguageProvider` initial `'en'` (avoids hydration mismatch), adopts localStorage/navigator after mount. Phase 1 = nav + Settings; plumbing ready to extend to Home/Insights/sheets.

---

## 7. Performance & optimization

**Solved:** functions ran in `iad1` (US) while DB in Mumbai → cross-globe latency. Fixed via `vercel.json` `regions: ["bom1"]`. Verify with `x-vercel-id: sin1::bom1`. Warm `/login` ~0.4s → ~0.23s; authed DB queries ~200ms → ~1–2ms.

### Optimization checklist / backlog
- [ ] **Cold starts** (~0.5s first hit, Hobby tier) — accept, or add warm-ping if it matters.
- [ ] **Query payload** — `getTransactions` fetches up to 2000 rows on Insights; consider server-side month filtering / aggregation as data grows.
- [ ] **Forecast** runs client-side over full history — fine now; watch as rows grow.
- [ ] **Region trade-off** — DB co-location wins over user-proximity; could A/B `sin1` (Singapore) for the Thailand→user hop if needed.
- [ ] **Keep `force-dynamic`** on authed pages (user-specific data) — don't cache.
- [ ] **Stay on Next 15.x**; re-run `npm run build` + `npx tsc --noEmit` before deploy.

---

## 8. Environment & deploy

**Env (NEXT_PUBLIC, public-safe):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

**Deploy:** `npx vercel --prod` (user authenticates Vercel/Supabase; agent runs CLI with cached session).

**Remaining manual config (Supabase dashboard, user-only):**
1. Auth → URL Configuration: Site URL `https://toptics.vercel.app` + Redirect `https://toptics.vercel.app/**` (keep localhost).
2. Reset-password email template must include `{{ .Token }}` (OTP code).
3. Free-tier email rate limit is low.

---

## 9. Conventions

- No emoji as icons — SVG only. THB, no decimals, Asia/Bangkok.
- Semantic color tokens, never hardcoded hex in components (one fixed: DonutChart track).
- Touch targets ≥44px; `cursor-pointer` on interactive; 150–300ms transitions.
- Append-only imports (never overwrite). Single wallet. No multi-tenant/sharing.
