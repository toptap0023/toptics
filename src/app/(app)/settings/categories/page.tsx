import { getCategories, getCategoryUsage } from "@/lib/queries";
import { CategoriesSettings } from "@/components/CategoriesSettings";
import { BackHeader } from "@/components/BackHeader";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const [categories, usage] = await Promise.all([
    getCategories(),
    getCategoryUsage(),
  ]);
  return (
    <>
      <BackHeader titleKey="cat.title" href="/settings" />
      <CategoriesSettings categories={categories} usage={usage} />
    </>
  );
}
