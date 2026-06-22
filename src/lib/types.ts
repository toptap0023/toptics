export type TxType = "income" | "expense";

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  currency: string;
  starting_balance: number;
  color: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TxType;
  color: string;
  icon: string;
  position: number;
  /** When true, expense transactions in this category are treated as money
   *  moved into investments: they still deduct from the wallet but are excluded
   *  from every living-expense analysis (trend, forecast, comparison, savings). */
  is_investment: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  category_id: string | null;
  type: TxType;
  amount: number;
  note: string | null;
  occurred_on: string; // YYYY-MM-DD
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  created_at: string;
}

/** A transaction joined with its category for display. */
export interface TransactionView extends Transaction {
  category: Pick<
    Category,
    "id" | "name" | "color" | "icon" | "type" | "is_investment"
  > | null;
}

/** Single source of truth for classifying a transaction as an investment
 *  contribution (an expense whose category is flagged). Used everywhere so the
 *  living-expense split stays consistent across Home, Insights, and forecast. */
export function isInvestmentTx(t: TransactionView): boolean {
  return t.type === "expense" && t.category?.is_investment === true;
}
