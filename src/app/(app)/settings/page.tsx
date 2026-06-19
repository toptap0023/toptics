import { SettingsHeader } from "@/components/SettingsHeader";
import { Settings } from "@/components/Settings";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getTransactions, getWallets } from "@/lib/queries";
import { bangkokYearMonth } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();

  // Export only ever covers the last 12 months (see EXPORT_RANGES), so fetch
  // just that window instead of thousands of rows — keeps the page payload small.
  const { year, month } = bangkokYearMonth(); // month is 0-based
  const absStart = year * 12 + month - 11;
  const exportFrom = `${Math.floor(absStart / 12)}-${String(
    (((absStart % 12) + 12) % 12) + 1
  ).padStart(2, "0")}-01`;

  const [{ data }, wallets, categories, transactions] = await Promise.all([
    supabase.auth.getUser(),
    getWallets(),
    getCategories(),
    getTransactions({ from: exportFrom }),
  ]);

  return (
    <>
      <SettingsHeader subtitle={data.user?.email ?? undefined} />
      <Settings
        wallets={wallets}
        categories={categories}
        transactions={transactions}
      />
    </>
  );
}
