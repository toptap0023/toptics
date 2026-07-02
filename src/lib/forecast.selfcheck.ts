import assert from "node:assert";
import { computeForecast } from "./forecast";
import type { TransactionView } from "./types";

// ponytail: one runnable check for the "ended recurring" fix.
// Car pays Jan–Mar then stops; Food stays active. Today = Jul 2026.
const cat = (id: string, name: string): TransactionView["category"] => ({
  id, name, color: "#fff", icon: "tag", type: "expense", is_investment: false,
});
const tx = (name: string, m: number, amt: number): TransactionView =>
  ({
    id: `${name}-${m}`, user_id: "u", wallet_id: "w", category_id: name,
    type: "expense", amount: amt, note: null,
    occurred_on: `2026-${String(m).padStart(2, "0")}-15`, created_at: "",
    category: cat(name, name),
  }) as TransactionView;

const txs: TransactionView[] = [];
for (let m = 1; m <= 6; m++) txs.push(tx("Food", m, 3000)); // active every month
for (let m = 1; m <= 3; m++) txs.push(tx("Car", m, 10000)); // stops after March

const f = computeForecast(txs, 2026, 6, [
  { id: "Food", name: "Food", color: "#fff" },
  { id: "Car", name: "Car", color: "#fff" },
])!;

const labels = f.perCat.map((c) => c.label);
assert(labels.includes("Food"), "Food (active) should be forecast");
assert(!labels.includes("Car"), "Car (paid off) must NOT be forecast");
assert(f.monthly > 0 && f.monthly < 6000, `headline should ~= Food only, got ${f.monthly}`);
console.log("forecast ended-recurring check OK:", f.monthly, labels);
