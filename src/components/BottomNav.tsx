"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, ChartIcon, SettingsIcon } from "@/components/icons";
import { useI18n } from "@/components/LanguageProvider";

const TABS = [
  { href: "/dashboard", key: "nav.home", Icon: HomeIcon },
  { href: "/analytics", key: "nav.insights", Icon: ChartIcon },
  { href: "/settings", key: "nav.settings", Icon: SettingsIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-bg-soft/90 backdrop-blur-lg pb-safe"
    >
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around px-2">
        {TABS.map(({ href, key, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors duration-200 cursor-pointer ${
                  active ? "text-teal" : "text-ink-muted hover:text-ink"
                }`}
              >
                <Icon className="w-6 h-6" />
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
