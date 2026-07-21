---
name: toptics-investment
description: Implement the "Investment" transaction feature in the TOPtics personal-finance app (single-wallet Next.js 15 + Supabase). Use when building or modifying investment tracking — recording investment contributions that deduct from the wallet but are excluded from living-expense analytics, the Investment Summary widget, the income-allocation donut, and the 5 investment sub-categories. Encodes finalized design decisions; follow them unless the user changes scope.
---

# TOPtics — Investment Feature Spec

Finalized via a design-grilling session. The goal: record money moved into investments so the
**single-wallet balance matches the bank**, while keeping it **out of every living-expense
analysis** (trend, forecast, comparison, savings rate). Deep portfolio analysis (value, returns,
tax ThaiESG/RMF) lives in a **separate app, TOPasset** — TOPtics only tracks the **cash flow**.

## Core model (the load-bearing decision)
- Investment = a normal **`type='expense'` transaction whose category is flagged** `is_investment=true`.
  - ✅ Wallet deducts automatically — `getBalance()` is unchanged (it already subtracts expenses).
  - ✅ Excluding it from analytics is one filter: `!t.category?.is_investment`.
- The flag lives on the **category**, NOT the transaction (no transaction-schema change, supports
  multiple investment buckets). `createTransaction`/`updateTransaction` need **no new field**.

## Key terms
- **livingExpense** = expenses where `!is_investment` (the "real spending" used in all analytics).
- **investment** = expenses where `is_investment`.
- **net cash** = `income − livingExpense − investment` (true wallet change for the period).
  - **Sign-aware label** (NOT an edge case — investment regularly exceeds income because the
    single wallet holds a cash buffer, e.g. severance/savings, that funds investment):
    - `≥ 0` → **"เหลือเก็บ +฿X"** (cash grew).
    - `< 0` → **"ดึงเงินสะสม −฿X"** (drew down the cash buffer — normal, honest, expected).
  - Same number, the label flips on sign. Never render a negative figure under the word "เหลือเก็บ".
- **savings rate** = `(income − livingExpense) / income` (investing must NOT lower the score —
  investing is saving; and it's funded from the buffer, not necessarily this month's income).

## 5 investment sub-categories (seed, coarse, aligned to TOPasset colors)
`type='expense', is_investment=true`:
| TH name | TOPasset map | color |
|---|---|---|
| หุ้น | Stock | `#6d5ef0` |
| กองทุน | Fund | `#36a8d8` |
| กองทุนลดหย่อน | Fund + ThaiESG/RMF/SSF tag | green |
| คริปโต | Crypto | `#e0a13a` |
| อื่นๆ | Bond/other | gray |
"What did I buy" detail goes in the existing **note** field (optional). Do NOT build per-asset
value/returns — that is TOPasset's job. TOPtics is flow-only / lightweight.

---

## Implementation phases (verify with tsc + build + preview after each)

### Phase 1 — Data
- Supabase migration: `alter table categories add column is_investment boolean not null default false;`
- Seed the 5 categories for the current user; update the `handle_new_user` trigger so new users get them.
- Leave existing transactions as living (no reclassification).
- `lib/types.ts`: add `Category.is_investment`; add `is_investment` to `TransactionView.category` pick.
- `lib/queries.ts`: `getTransactions` join → `categories(id,name,color,icon,type,is_investment)`.
  `getCategories` already `select("*")` (gets it free). **Do NOT touch `getBalance()`.**

### Phase 2 — Entry form (`components/TransactionSheet.tsx`)
- 3-way toggle **รายจ่าย / รายรับ / ลงทุน** as a **UI filter** (storage stays `type='expense'` for investment).
  - submit `type`: investment→`expense`, income→`income`, expense→`expense`.
  - grid filter: expense → `type==='expense' && !is_investment`; investment → `type==='expense' && is_investment`; income → `type==='income'`.
  - edit mode: derive initial toggle from `initial.category?.is_investment`.
- `actions.ts` `createCategory` + `components/Settings.tsx`: add an "เป็นการลงทุน" toggle so users can create more investment categories.

### Phase 3 — Insights analytics core (`components/InsightsClient.tsx`) — biggest blast radius
- In the analytics `useMemo`, split `expense` → `livingExpense` + `investment` (+ investment by
  sub-category + an investment transaction list). `segments` (per-category donut) and `pastExp`
  (comparison baselines) become **living-only**.
- Propagate livingExpense to: "Spending this month" / avg-per-day / Comparison / **Forecast** /
  Health / AI Coach.
  - **Forecast**: filter investment out of BOTH the input transactions AND the `expenseCategories`
    list passed to `computeForecast` (else investment perCat rows reappear).
- Health: `savings rate` uses livingExpense; add a positive action when investing; AI-coach prompt
  gains an `INVESTMENTS` section and clarifies "expenses exclude investments."
- Totals card: 3 tiles รายรับ / รายจ่าย / **ลงทุน** + a prominent **เหลือเก็บ** line.

### Phase 4 — New Insights widgets
- **3-bar comparison (รายรับ / รายจ่าย / ลงทุน)** — REPLACES the income-allocation donut.
  Three horizontal bars on ONE shared scale (`max` of the three), so it stays truthful for
  ANY relationship including ลงทุน > รายรับ (no "parts of a whole" constraint, no negative-slice
  problem). Below the bars show the sign-aware **net cash** line ("เหลือเก็บ +฿X" / "ดึงเงินสะสม
  −฿X"). This is the primary proportional view; chosen over a donut precisely because
  investment-exceeds-income is a regular case for this user.
- **Investment Summary widget** (place under Account status): headline = absolute period total
  (฿) as the hero number, with a secondary **"X% ของเงินที่จ่ายออก"** (investment ÷
  (livingExpense + investment) — always ≤100%, always meaningful). When investment > income,
  ALSO show a badge **"= N.N เท่าของรายรับเดือนนี้"** (a striking, useful insight, not an error).
  Do NOT use "% of income" as the headline metric (it exceeds 100% and reads as broken).
  Then: breakdown by sub-category; recent transaction list (date · note · amount); link
  "ดูพอร์ตเต็มใน TOPasset →".
- Keep the existing per-category donut, now living-only.

### Phase 5 — Home (`components/MonthHome.tsx`, `components/MonthSelectorChart.tsx`)
- Totals row: add ลงทุน + เหลือเก็บ; `expense` shown = living.
- MonthSelectorChart: keep 2 bars (income / expense) but the expense bar = living
  (filter investment out) so the trend stays clean.

### Phase 6 — i18n + verify
- `lib/i18n.ts`: add TH/EN for ลงทุน, เหลือเก็บ, the 5 category names, Investment Summary labels,
  allocation labels, the toggle, etc. (uses the `{param}` interpolation already in the dictionary).
- Verify: `npx tsc --noEmit`, `npm run build`, preview the add-investment flow + Insights in Thai.

## Risk checklist
1. `expense` is referenced widely in InsightsClient — rename to livingExpense carefully.
2. Forecast must drop investment from input **and** category list.
3. MonthSelectorChart must exclude investment or the Home trend spikes.
4. net cash is FREQUENTLY negative (investment > income, funded from buffer) — sign-aware label, not an error state.
5. Investment Summary headline uses % of OUTFLOW (≤100%), not % of income; add "Nx รายรับ" badge when investment > income.
6. Confirm investment still deducts from balance (it does — `type='expense'`).

## Related
- TOPasset app: `~/Downloads/TOPasset` (separate Supabase project; snapshot wealth dashboard).
  TOPtics = flow, TOPasset = stock — complementary, do not duplicate TOPasset's value/returns/tax.
