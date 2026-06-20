"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { translate, type Lang } from "@/lib/i18n";

type TParams = Record<string, string | number>;

interface LangContext {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, params?: TParams) => string;
}

const Ctx = createContext<LangContext>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

const KEY = "toptics:lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Start as "en" on both server + first client paint to avoid a hydration
  // mismatch; adopt the stored / browser language after mount.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    let initial: Lang | null = null;
    try {
      const stored = localStorage.getItem(KEY);
      if (stored === "en" || stored === "th") initial = stored;
    } catch {
      /* ignore */
    }
    if (!initial && navigator.language?.toLowerCase().startsWith("th")) {
      initial = "th";
    }
    if (initial && initial !== "en") setLangState(initial);
    if (initial) document.documentElement.lang = initial;
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: string, params?: TParams) => translate(lang, key, params),
    [lang]
  );

  return (
    <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
  );
}

export const useI18n = () => useContext(Ctx);
