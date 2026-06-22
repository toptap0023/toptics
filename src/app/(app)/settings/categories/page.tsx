import { getCategories } from "@/lib/queries";
import { CategoriesSettings } from "@/components/CategoriesSettings";
import { BackHeader } from "@/components/BackHeader";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <>
      <BackHeader title="ตั้งค่าหมวดหมู่" href="/settings" />
      <CategoriesSettings categories={categories} />
    </>
  );
}
