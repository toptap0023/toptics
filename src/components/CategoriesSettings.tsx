"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";
import { Card } from "@/components/Card";
import { CategoryGlyph, PlusIcon, TrashIcon } from "@/components/icons";
import { createCategory, deleteCategory } from "@/app/(app)/actions";
import { useI18n } from "@/components/LanguageProvider";
import { useToast } from "@/components/Toast";

export function CategoriesSettings({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { t } = useI18n();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [cName, setCName] = useState("");
  const [cType, setCType] = useState<"expense" | "income">("expense");
  const [cInvest, setCInvest] = useState(false);

  function run(fn: () => Promise<{ error?: string } | void>, after?: () => void) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res && "error" in res && res.error) { setError(res.error); return; }
      after?.();
      router.refresh();
    });
  }

  function addCategory() {
    if (!cName.trim()) return setError(t("cat.nameError"));
    const fd = new FormData();
    fd.set("name", cName.trim());
    fd.set("type", cInvest ? "expense" : cType);
    fd.set("is_investment", String(cInvest));
    run(() => createCategory(fd), () => { setCName(""); setCInvest(false); toast(t("toast.added")); });
  }

  function removeCategory(id: string) {
    if (!confirm(t("cat.confirmDelete"))) return;
    const fd = new FormData();
    fd.set("id", id);
    run(() => deleteCategory(fd), () => toast(t("toast.deleted")));
  }

  const expense = categories.filter((c) => c.type === "expense" && !c.is_investment);
  const income = categories.filter((c) => c.type === "income");
  const investment = categories.filter((c) => c.is_investment);

  return (
    <div className="px-5 pt-5 pb-8 flex flex-col gap-4">
      {error ? <p role="alert" className="text-sm text-neg">{error}</p> : null}

      <CategoryGroup heading={t("cat.expense")} color="neg" items={expense} onRemove={removeCategory} pending={pending} />
      <CategoryGroup heading={t("cat.income")} color="pos" items={income} onRemove={removeCategory} pending={pending} />
      <CategoryGroup heading={t("cat.investment")} color="teal" items={investment} onRemove={removeCategory} pending={pending} />

      {/* Add form */}
      <Card className="p-4 flex flex-col gap-3">
        {cInvest ? (
          <div className="rounded-xl border border-teal/40 bg-teal/10 px-4 py-2.5 text-sm font-semibold text-teal">
            {t("cat.expense")}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-bg-panel2 p-1">
            {(["expense", "income"] as const).map((ty) => (
              <button
                key={ty}
                type="button"
                onClick={() => setCType(ty)}
                className={`rounded-lg py-2 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                  cType === ty
                    ? ty === "income" ? "bg-pos text-bg" : "bg-neg text-bg"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {ty === "income" ? t("cat.income") : t("cat.expense")}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">{t("cat.isInvestment")}</p>
            <p className="text-xs text-ink-muted">{t("cat.isInvestmentHint")}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={cInvest}
            aria-label={t("cat.isInvestment")}
            onClick={() => setCInvest((v) => !v)}
            className={`relative flex-none h-7 w-12 rounded-full transition-colors duration-200 cursor-pointer ${
              cInvest ? "bg-teal" : "bg-bg-panel2 border border-line"
            }`}
          >
            <span
              className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-bg shadow-sm transition-all duration-200 ${
                cInvest ? "left-[26px]" : "left-1"
              }`}
            />
          </button>
        </div>

        <input
          value={cName}
          onChange={(e) => setCName(e.target.value)}
          placeholder={t("cat.newName")}
          aria-label={t("cat.newName")}
          className="rounded-xl bg-bg-panel border border-line px-4 py-3 focus:border-teal"
        />
        <button
          onClick={addCategory}
          disabled={pending}
          className="flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 font-semibold text-bg shadow-glow transition-colors duration-200 hover:bg-teal-dark disabled:opacity-60 cursor-pointer"
        >
          <PlusIcon className="w-5 h-5" />
          {t("cat.add")}
        </button>
      </Card>
    </div>
  );
}

const COLOR = {
  neg:  { header: "bg-neg/10 text-neg",  dot: "bg-neg/20"  },
  pos:  { header: "bg-pos/10 text-pos",  dot: "bg-pos/20"  },
  teal: { header: "bg-teal/10 text-teal", dot: "bg-teal/20" },
} as const;

function CategoryGroup({
  heading,
  color,
  items,
  onRemove,
  pending,
}: {
  heading: string;
  color: keyof typeof COLOR;
  items: Category[];
  onRemove: (id: string) => void;
  pending: boolean;
}) {
  if (items.length === 0) return null;
  const theme = COLOR[color];
  return (
    <Card className="overflow-hidden">
      <div className={`px-4 py-2 flex items-center gap-2 ${theme.header}`}>
        <span className={`h-2 w-2 rounded-full ${theme.dot}`} />
        <p className="text-xs font-bold uppercase tracking-wider">{heading}</p>
      </div>
      <div className="divide-y divide-line">
        {items.map((c) => (
          <div key={c.id} className="flex items-center gap-3 px-4 py-2.5">
            <span
              className="grid h-8 w-8 flex-none place-items-center rounded-lg"
              style={{ backgroundColor: c.color + "22" }}
            >
              <CategoryGlyph icon={c.icon} className="w-4 h-4" style={{ color: c.color }} />
            </span>
            <p className="min-w-0 flex-1 truncate text-sm">{c.name}</p>
            <button
              onClick={() => onRemove(c.id)}
              disabled={pending}
              aria-label={`Delete category ${c.name}`}
              className="text-ink-muted transition-colors duration-200 hover:text-neg disabled:opacity-40 cursor-pointer"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
