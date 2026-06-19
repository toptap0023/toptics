import { MonthHome } from "@/components/MonthHome";
import { getCategories, getTransactions, getWallets } from "@/lib/queries";
import { CURRENCY } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [wallets, categories, transactions] = await Promise.all([
    getWallets(),
    getCategories(),
    getTransactions({ limit: 1000 }),
  ]);

  return (
    <MonthHome
      wallets={wallets}
      categories={categories}
      transactions={transactions}
      currency={CURRENCY}
    />
  );
}
