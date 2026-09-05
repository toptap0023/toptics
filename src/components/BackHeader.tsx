"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";
import { useI18n } from "@/components/LanguageProvider";

export function BackHeader({
  title,
  titleKey,
  href,
}: {
  title?: string;
  /** i18n key, preferred over `title` so server pages stay language-aware. */
  titleKey?: string;
  href: string;
}) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg-soft/85 backdrop-blur-lg pt-safe">
      <div className="mx-auto flex max-w-2xl items-center gap-1 px-2 py-3.5">
        <Link
          href={href}
          className="grid h-10 w-10 place-items-center text-ink-muted hover:text-ink transition-colors duration-200 cursor-pointer"
          aria-label={t("common.back")}
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight">
          {titleKey ? t(titleKey) : title}
        </h1>
      </div>
    </header>
  );
}
