"use client";

import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons";
import { Card } from "@/components/Card";
import { useI18n } from "@/components/LanguageProvider";
import { useTheme, type Theme } from "@/components/ThemeProvider";
import type { Lang } from "@/lib/i18n";

export function Preferences() {
  const router = useRouter();
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-bg-soft/85 backdrop-blur-lg pt-safe">
        <div className="mx-auto flex max-w-2xl items-center gap-1 px-3 py-3.5">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="grid h-10 w-10 place-items-center rounded-xl text-ink-muted transition-colors duration-200 hover:text-ink hover:bg-bg-panel cursor-pointer"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">{t("pref.title")}</h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 pt-5 pb-8 flex flex-col gap-4">
        <Card className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink-muted">
              {t("pref.appearance")}
            </span>
            <Segmented<Theme>
              value={theme}
              onChange={setTheme}
              options={[
                { value: "system", label: t("theme.system") },
                { value: "light", label: t("theme.light") },
                { value: "dark", label: t("theme.dark") },
              ]}
            />
          </div>
          <div className="flex flex-col gap-2 border-t border-line pt-4">
            <span className="text-sm font-medium text-ink-muted">
              {t("pref.language")}
            </span>
            <Segmented<Lang>
              value={lang}
              onChange={setLang}
              options={[
                { value: "en", label: "EN" },
                { value: "th", label: "ไทย" },
              ]}
            />
          </div>
        </Card>
      </div>
    </>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div
      className="grid gap-1 rounded-xl bg-bg-panel2 p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`rounded-lg py-2 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
            value === o.value
              ? "bg-teal text-bg shadow-glow"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
