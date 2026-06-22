"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category, TransactionView, Wallet } from "@/lib/types";
import { Amount } from "@/components/Amount";
import { TransactionSheet } from "@/components/TransactionSheet";
import { CategoryGlyph, EditIcon, TrashIcon } from "@/components/icons";
import { deleteTransaction } from "@/app/(app)/actions";
import { useI18n } from "@/components/LanguageProvider";
import { useToast } from "@/components/Toast";

export function TransactionRow({
  tx,
  wallets,
  categories,
  currency,
}: {
  tx: TransactionView;
  wallets: Wallet[];
  categories: Category[];
  currency: string;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const toast = useToast();
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const color = tx.category?.color ?? "#8aa0bd";

  function handleDelete() {
    if (!confirm("Delete this transaction?")) return;
    const fd = new FormData();
    fd.set("id", tx.id);
    startTransition(async () => {
      await deleteTransaction(fd);
      toast(t("toast.deleted"));
      router.refresh();
    });
  }

  return (
    <div className={pending ? "opacity-50" : ""}>
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-bg-panel2/40 cursor-pointer"
      >
        <span
          className="grid h-10 w-10 flex-none place-items-center rounded-xl"
          style={{ backgroundColor: color + "22" }}
        >
          <CategoryGlyph
            icon={tx.category?.icon ?? "tag"}
            className="w-5 h-5"
            style={{ color }}
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">
            {tx.category?.name ?? "Uncategorized"}
          </p>
          {tx.note ? (
            <p className="text-xs text-ink-muted truncate">{tx.note}</p>
          ) : null}
        </div>
        <Amount
          value={Number(tx.amount)}
          currency={currency}
          type={tx.type}
          signed
          className="font-semibold"
        />
      </button>

      {expanded ? (
        <div className="flex items-center gap-2 px-4 pb-3 -mt-1">
          <TransactionSheet
            wallets={wallets}
            categories={categories}
            initial={tx}
            trigger={(open) => (
              <button
                onClick={open}
                className="flex items-center gap-1.5 rounded-lg border border-line bg-bg-panel px-3 py-2 text-xs font-medium text-ink-muted transition-colors duration-200 hover:text-ink cursor-pointer"
              >
                <EditIcon className="w-4 h-4" />
                Edit
              </button>
            )}
          />
          <button
            onClick={handleDelete}
            disabled={pending}
            className="flex items-center gap-1.5 rounded-lg border border-neg/30 bg-neg/10 px-3 py-2 text-xs font-medium text-neg transition-colors duration-200 hover:bg-neg/20 disabled:opacity-60 cursor-pointer"
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}
