# Spendee Clone — Personal Finance Tracker

A mobile-first personal finance app (a [Spendee](https://www.spendee.com/) clone) built with
**Next.js 15**, **Supabase** (Postgres + Auth), and **Tailwind CSS**. Track wallets, income and
expenses, set monthly budgets, and view spending insights. Designed for iPhone-class screens,
installable as a PWA, and deployable to **Vercel** on free tiers.

- Email/password auth (Supabase) with per-user **Row Level Security**
- Wallets, categories, transactions, and monthly budgets
- Dashboard with balance, monthly income/expense, and a spend-by-category donut
- Activity list grouped by date, with inline edit & delete
- Budgets with progress bars and over-budget warnings
- Insights: 6-month income-vs-expense bars + category breakdown
- SVG icons only (no emoji), safe-area aware, dark OLED-friendly theme

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com/) → **New project**. Pick a name and a database password.
2. Once it's ready, open **SQL Editor → New query**, paste the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql), and click **Run**.
   This creates the tables, RLS policies, and a trigger that seeds a starter wallet + default
   categories for every new user.
3. Open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> **Tip — skip email confirmation for personal use:** In **Authentication → Sign In / Providers →
> Email**, turn **Confirm email** off. Then sign-up logs you straight in. Leave it on if you want
> email verification.

## 2. Run it locally

```bash
cp .env.local.example .env.local   # then paste your URL + anon key
npm install
npm run dev
```

Open <http://localhost:3000>, create an account, and start adding transactions.

## 3. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In [Vercel](https://vercel.com/) → **Add New → Project**, import the repo (framework
   auto-detects as **Next.js**).
3. Under **Environment Variables**, add the same two values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy.** No other configuration is required.

After deploying, open the site on your iPhone in Safari → **Share → Add to Home Screen** to
install it as a full-screen app.

---

## Project structure

```
src/
  middleware.ts                 Session refresh + route guard
  lib/
    supabase/{client,server,middleware}.ts
    types.ts  format.ts  queries.ts
  app/
    layout.tsx  globals.css  manifest.ts  page.tsx
    login/                      Auth UI + server actions
    auth/signout/route.ts
    (app)/
      layout.tsx                App shell + bottom nav (auth-guarded)
      actions.ts                Server actions (CRUD)
      dashboard/  transactions/  budgets/  analytics/  settings/
  components/                   UI: nav, charts, sheets, icons, cards
supabase/schema.sql             Database schema + RLS + seed trigger
public/icon.svg                 App icon
prototype/index.html            Original static design reference (not used by the app)
```

## Data model

| Table          | Purpose                                                        |
| -------------- | -------------------------------------------------------------- |
| `wallets`      | Accounts with a currency and starting balance                  |
| `categories`   | Income/expense categories (color + icon)                       |
| `transactions` | Income/expense entries linked to a wallet and category         |
| `budgets`      | One monthly budget amount per category                         |

All tables are protected by Row Level Security so each user only ever sees their own rows.

## Notes

- The display currency comes from your first wallet. Change it in **Settings**.
- "Total balance" = sum of wallet starting balances + all income − all expenses.
- Charts are hand-rolled SVG — no charting dependency, fast on mobile.
- This app is for personal use; there is no multi-tenant org/sharing layer.
