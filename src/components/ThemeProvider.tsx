"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme = "system" | "light" | "dark";

interface ThemeContext {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<ThemeContext>({ theme: "dark", setTheme: () => {} });

const KEY = "toptics:theme";

/** Apply the resolved theme by toggling the `light` class on <html>. */
function apply(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("light", !dark);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to "dark" (the app's identity) until a stored preference loads.
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    let stored: Theme = "dark";
    try {
      const v = localStorage.getItem(KEY);
      if (v === "system" || v === "light" || v === "dark") stored = v;
    } catch {
      /* ignore */
    }
    setThemeState(stored);
  }, []);

  useEffect(() => {
    apply(theme);
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => apply("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
