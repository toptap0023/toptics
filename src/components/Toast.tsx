"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Tone = "ok" | "error";
type Item = { id: number; msg: string; tone: Tone };

// ponytail: tiny in-house toast (context + auto-dismiss), no dependency.
const ToastCtx = createContext<(msg: string, tone?: Tone) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

let seq = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);

  const toast = useCallback((msg: string, tone: Tone = "ok") => {
    const id = ++seq;
    setItems((x) => [...x, { id, msg, tone }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 2800);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4">
        {items.map((i) => (
          <div
            key={i.id}
            role="status"
            className={`pointer-events-auto max-w-sm rounded-xl px-4 py-2.5 text-sm font-medium shadow-card backdrop-blur-lg ${
              i.tone === "error"
                ? "bg-neg/90 text-white"
                : "border border-line bg-bg-panel2/95 text-ink"
            }`}
          >
            {i.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
