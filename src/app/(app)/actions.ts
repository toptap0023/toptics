"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TxType } from "@/lib/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

function revalidateAll() {
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/analytics");
  revalidatePath("/settings");
}

/* ------------------------------ Transactions ----------------------------- */

export async function createTransaction(formData: FormData) {
  const { supabase, user } = await requireUser();

  const type = String(formData.get("type")) as TxType;
  const amount = Number(formData.get("amount"));
  const wallet_id = String(formData.get("wallet_id"));
  const categoryRaw = String(formData.get("category_id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const occurred_on = String(formData.get("occurred_on"));

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter an amount greater than zero." };
  }
  if (!wallet_id) return { error: "Choose a wallet." };

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    wallet_id,
    category_id: categoryRaw || null,
    type: type === "income" ? "income" : "expense",
    amount: Math.round(amount),
    note: note || null,
    occurred_on,
  });

  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function updateTransaction(formData: FormData) {
  const { supabase, user } = await requireUser();

  const id = String(formData.get("id"));
  const type = String(formData.get("type")) as TxType;
  const amount = Number(formData.get("amount"));
  const wallet_id = String(formData.get("wallet_id"));
  const categoryRaw = String(formData.get("category_id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const occurred_on = String(formData.get("occurred_on"));

  if (!id) return { error: "Missing transaction id." };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter an amount greater than zero." };
  }

  const { error } = await supabase
    .from("transactions")
    .update({
      wallet_id,
      category_id: categoryRaw || null,
      type: type === "income" ? "income" : "expense",
      amount: Math.round(amount),
      note: note || null,
      occurred_on,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function deleteTransaction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id"));
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

/* -------------------------------- Wallets -------------------------------- */

export async function updateWallet(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const starting_balance =
    Math.round(Number(formData.get("starting_balance") ?? 0)) || 0;

  if (!id) return { error: "Missing wallet id." };
  if (!name) return { error: "Name your wallet." };

  const { error } = await supabase
    .from("wallets")
    .update({ name, starting_balance })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

/* ------------------------------- Categories ------------------------------ */

const PALETTE = [
  "#19c2a8",
  "#28c76f",
  "#5b8def",
  "#a78bfa",
  "#22d3ee",
  "#ff6b6b",
  "#f472b6",
  "#facc15",
  "#ffb648",
  "#8aa0bd",
];

export async function createCategory(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type")) === "income" ? "income" : "expense";
  const color = String(formData.get("color") ?? "") || PALETTE[name.length % PALETTE.length];

  if (!name) return { error: "Name your category." };

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name,
    type,
    color,
    icon: "tag",
  });
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function deleteCategory(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id"));
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

/* ------------------------------ Data import ------------------------------ */

/**
 * Append imported expenses from a monthly budget snapshot across one or more
 * months. Insert-only — never overwrites or edits existing data. Each item
 * carries its own date (last day of its month). Categories that don't exist
 * yet are created automatically. Income is untouched.
 */
export async function importTransactions(formData: FormData) {
  const { supabase, user } = await requireUser();

  let items: {
    category_id?: string | null;
    category_name?: string;
    amount: number;
    occurred_on: string;
  }[];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "Could not read the import data." };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Nothing to import." };
  }

  const { data: wallets } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);
  const wallet_id = wallets?.[0]?.id;
  if (!wallet_id) return { error: "No wallet found." };

  // Resolve categories: match existing by name, create the rest.
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const { data: existing } = await supabase
    .from("categories")
    .select("id, name")
    .eq("user_id", user.id)
    .eq("type", "expense");
  const byName = new Map<string, string>();
  const byId = new Set<string>();
  for (const c of existing ?? []) {
    byName.set(norm(c.name), c.id);
    byId.add(c.id);
  }

  const toCreate = new Map<string, string>(); // normalized -> display name
  for (const it of items) {
    if (it.category_id && byId.has(it.category_id)) continue;
    const name = (it.category_name ?? "").trim();
    if (!name) continue;
    const n = norm(name);
    if (byName.has(n) || toCreate.has(n)) continue;
    toCreate.set(n, name);
  }

  if (toCreate.size > 0) {
    const newRows = [...toCreate.values()].map((name) => ({
      user_id: user.id,
      name,
      type: "expense" as const,
      color: PALETTE[name.length % PALETTE.length],
      icon: "tag",
    }));
    const { data: created, error: createErr } = await supabase
      .from("categories")
      .insert(newRows)
      .select("id, name");
    if (createErr) return { error: createErr.message };
    for (const c of created ?? []) byName.set(norm(c.name), c.id);
  }

  type Row = {
    user_id: string;
    wallet_id: string;
    category_id: string;
    type: "expense";
    amount: number;
    note: string;
    occurred_on: string;
  };
  const rows: Row[] = [];
  for (const it of items) {
    let cid =
      it.category_id && byId.has(it.category_id) ? it.category_id : null;
    if (!cid) {
      const name = (it.category_name ?? "").trim();
      if (name) cid = byName.get(norm(name)) ?? null;
    }
    const amount = Math.round(Number(it.amount));
    if (!cid || !(amount > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(it.occurred_on))
      continue;
    rows.push({
      user_id: user.id,
      wallet_id,
      category_id: cid,
      type: "expense",
      amount,
      note: "Imported",
      occurred_on: it.occurred_on,
    });
  }

  if (rows.length === 0) return { error: "Nothing valid to import." };

  const { error } = await supabase.from("transactions").insert(rows);
  if (error) return { error: error.message };

  revalidateAll();
  return { ok: true, count: rows.length };
}
