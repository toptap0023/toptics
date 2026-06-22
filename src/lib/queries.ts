import { createClient } from "@/lib/supabase/server";
import type { Category, TransactionView, Wallet } from "@/lib/types";

export async function getWallets(): Promise<Wallet[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("wallets")
    .select("*")
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("type", { ascending: true })
    .order("position", { ascending: true })
    .order("name", { ascending: true });
  return data ?? [];
}

interface TxFilter {
  limit?: number;
  from?: string;
  to?: string;
  type?: "income" | "expense";
  categoryId?: string;
}

export async function getTransactions(
  filter: TxFilter = {}
): Promise<TransactionView[]> {
  const supabase = await createClient();
  let query = supabase
    .from("transactions")
    .select(
      "*, category:categories(id,name,color,icon,type,is_investment)"
    )
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (filter.from) query = query.gte("occurred_on", filter.from);
  if (filter.to) query = query.lte("occurred_on", filter.to);
  if (filter.type) query = query.eq("type", filter.type);
  if (filter.categoryId) query = query.eq("category_id", filter.categoryId);
  if (filter.limit) query = query.limit(filter.limit);

  const { data } = await query;
  return (data as TransactionView[] | null) ?? [];
}

/** Total current balance = all income − all expenses (no opening balance —
 *  starting balances are unused; record any pre-existing money as income). */
export async function getBalance(): Promise<number> {
  const supabase = await createClient();
  const { data: txs } = await supabase
    .from("transactions")
    .select("type, amount");

  return (txs ?? []).reduce(
    (sum, t) => sum + (t.type === "income" ? Number(t.amount) : -Number(t.amount)),
    0
  );
}
