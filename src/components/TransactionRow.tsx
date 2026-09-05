"use client";

import type { Category, TransactionView, Wallet } from "@/lib/types";
import { Amount } from "@/components/Amount";
import { TransactionSheet } from "@/components/TransactionSheet";
import { CategoryGlyph, ChevronRightIcon } from "@/components/icons";
import { useI18n } from "@/components/LanguageProvider";

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
  const { t } = useI18n();
  const color = tx.category?.color ?? "#8aa0bd";

  // One tap opens the edit sheet (delete lives inside it), instead of the old
  // tap-to-expand row with a second row of small edit/delete buttons.
  return (
    <TransactionSheet
      wallets={wallets}
      categories={categories}
      initial={tx}
      trigger={(open) => (
        <button
          type="button"
          onClick={open}
          aria-label={`${tx.category?.name ?? t("common.uncategorized")}${
            tx.note ? `, ${tx.note}` : ""
          }`}
          className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-bg-panel2/40 active:bg-bg-panel2/60 cursor-pointer"
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
              {tx.category?.name ?? t("common.uncategorized")}
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
          <ChevronRightIcon className="w-4 h-4 flex-none text-ink-muted/50 transition-colors duration-200 group-hover:text-ink-muted" />
        </button>
      )}
    />
  );
}
