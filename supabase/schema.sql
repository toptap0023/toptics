-- =====================================================================
-- Spendee Clone — Supabase schema
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- Safe to re-run (idempotent where practical).
-- =====================================================================

-- ---------- WALLETS -------------------------------------------------
create table if not exists public.wallets (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  name             text not null,
  currency         text not null default 'USD',
  starting_balance numeric(14,2) not null default 0,
  color            text not null default '#19c2a8',
  created_at       timestamptz not null default now()
);

-- ---------- CATEGORIES ----------------------------------------------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  type       text not null check (type in ('income','expense')),
  color      text not null default '#8aa0bd',
  icon       text not null default 'tag',
  created_at timestamptz not null default now()
);

-- ---------- TRANSACTIONS --------------------------------------------
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  wallet_id   uuid not null references public.wallets (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  type        text not null check (type in ('income','expense')),
  amount      numeric(14,2) not null check (amount >= 0),
  note        text,
  occurred_on date not null default current_date,
  created_at  timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, occurred_on desc);

-- ---------- BUDGETS (monthly, per category) -------------------------
create table if not exists public.budgets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  amount      numeric(14,2) not null check (amount > 0),
  created_at  timestamptz not null default now(),
  unique (user_id, category_id)
);

-- =====================================================================
-- Row Level Security — each user only sees their own rows
-- =====================================================================
alter table public.wallets      enable row level security;
alter table public.categories   enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets      enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['wallets','categories','transactions','budgets']
  loop
    execute format('drop policy if exists "owner_select" on public.%I', t);
    execute format('drop policy if exists "owner_insert" on public.%I', t);
    execute format('drop policy if exists "owner_update" on public.%I', t);
    execute format('drop policy if exists "owner_delete" on public.%I', t);

    execute format(
      'create policy "owner_select" on public.%I for select using (auth.uid() = user_id)', t);
    execute format(
      'create policy "owner_insert" on public.%I for insert with check (auth.uid() = user_id)', t);
    execute format(
      'create policy "owner_update" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format(
      'create policy "owner_delete" on public.%I for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- =====================================================================
-- Seed defaults for every new user (a starter wallet + categories)
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.wallets (user_id, name, currency, starting_balance)
  values (new.id, 'Cash', 'USD', 0);

  insert into public.categories (user_id, name, type, color, icon) values
    (new.id, 'Salary',        'income',  '#28c76f', 'wallet'),
    (new.id, 'Other income',  'income',  '#3fe0c6', 'plus'),
    (new.id, 'Groceries',     'expense', '#19c2a8', 'cart'),
    (new.id, 'Dining',        'expense', '#ffb648', 'food'),
    (new.id, 'Transport',     'expense', '#5b8def', 'car'),
    (new.id, 'Housing',       'expense', '#a78bfa', 'home'),
    (new.id, 'Utilities',     'expense', '#22d3ee', 'bolt'),
    (new.id, 'Health',        'expense', '#ff6b6b', 'heart'),
    (new.id, 'Shopping',      'expense', '#f472b6', 'bag'),
    (new.id, 'Entertainment', 'expense', '#facc15', 'play'),
    (new.id, 'Other',         'expense', '#8aa0bd', 'tag');

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
