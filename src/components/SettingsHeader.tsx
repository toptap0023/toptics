"use client";

import Link from "next/link";
import { UserIcon } from "@/components/icons";
import { useI18n } from "@/components/LanguageProvider";

export function SettingsHeader({ subtitle }: { subtitle?: string }) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg-soft/85 backdrop-blur-lg pt-safe">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-5 py-3.5">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight truncate">
            {t("settings.title")}
          </h1>
          {subtitle ? (
            <p className="text-xs text-ink-muted truncate">{subtitle}</p>
          ) : null}
        </div>

        <Link
          href="/preferences"
          aria-label={t("pref.title")}
          className="-mr-2 ml-auto grid h-10 w-10 place-items-center text-ink-muted transition-colors duration-200 hover:text-ink cursor-pointer"
        >
          <UserIcon className="w-6 h-6" />
        </Link>
      </div>
    </header>
  );
}
