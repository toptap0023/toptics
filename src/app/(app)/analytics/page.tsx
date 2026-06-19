import { InsightsClient } from "@/components/InsightsClient";
import { getBalance, getCategories, getTransactions } from "@/lib/queries";
import { CURRENCY, bangkokYearMonth } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ ym?: string }>;
}) {
  const { ym } = await searchParams;
  const [balance, transactions, categories] = await Promise.all([
    getBalance(),
    getTransactions({ limit: 2000 }),
    getCategories(),
  ]);

  // ?ym=YYYY-MM selects that month; otherwise default to the current month.
  let initialOffset = 0;
  if (ym) {
    const [y, m] = ym.split("-").map(Number);
    if (Number.isFinite(y) && Number.isFinite(m)) {
      const { year, month } = bangkokYearMonth();
      initialOffset = y * 12 + (m - 1) - (year * 12 + month);
    }
  }

  return (
    <InsightsClient
      transactions={transactions}
      categories={categories}
      balance={balance}
      currency={CURRENCY}
      initialOffset={initialOffset}
    />
  );
}
