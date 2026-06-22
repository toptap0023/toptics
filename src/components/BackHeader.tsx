"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";

export function BackHeader({ title, href }: { title: string; href: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg-soft/85 backdrop-blur-lg pt-safe">
      <div className="mx-auto flex max-w-2xl items-center gap-1 px-2 py-3.5">
        <Link
          href={href}
          className="grid h-10 w-10 place-items-center text-ink-muted hover:text-ink transition-colors duration-200 cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      </div>
    </header>
  );
}
