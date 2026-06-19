"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/icons";
import { resendCode, verifyAndReset } from "./actions";

export function ResetPasswordForm({ email: initialEmail }: { email: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(
    initialEmail ? `We emailed a 6-digit code to ${initialEmail}.` : null
  );
  const [pending, startTransition] = useTransition();
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(
      () => setCooldown((c) => (c <= 1 ? 0 : c - 1)),
      1000
    );
    return () => clearInterval(id);
  }, [cooldown]);

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await verifyAndReset(formData);
      if (res?.error) setError(res.error);
      // success → the action redirects to /dashboard
    });
  }

  function resend() {
    if (cooldown > 0 || pending || !email.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await resendCode(email);
      if (res?.error) {
        setError(res.error);
      } else {
        setInfo(`A new code was sent to ${email}.`);
        setCooldown(45);
      }
    });
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-5 py-12 pt-safe pb-safe">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-black border-2 border-white grid place-items-center shadow-glow">
            <BrandMark className="w-9 h-9" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            Set a new password
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Enter the 6-digit code from your email and a new password.
          </p>
        </div>

        {error ? (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-neg/40 bg-neg/10 px-4 py-3 text-sm text-neg"
          >
            {error}
          </div>
        ) : null}
        {info && !error ? (
          <div
            role="status"
            className="mb-4 rounded-xl border border-teal/40 bg-teal/10 px-4 py-3 text-sm text-teal-light"
          >
            {info}
          </div>
        ) : null}

        <form action={submit} className="flex flex-col gap-4">
          {initialEmail ? (
            <input type="hidden" name="email" value={email} />
          ) : (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-ink-muted">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-xl bg-bg-panel border border-line px-4 py-3 text-ink placeholder:text-ink-muted/60 focus:border-teal"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="code" className="text-sm font-medium text-ink-muted">
              6-digit code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              placeholder="••••••"
              className="rounded-xl bg-bg-panel border border-line px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] tabular-nums placeholder:tracking-[0.3em] focus:border-teal"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-ink-muted"
            >
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              placeholder="••••••••"
              className="rounded-xl bg-bg-panel border border-line px-4 py-3 text-ink placeholder:text-ink-muted/60 focus:border-teal"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-xl bg-teal px-4 py-3.5 font-semibold text-bg shadow-glow transition-colors duration-200 hover:bg-teal-dark disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {pending ? "Saving…" : "Reset password"}
          </button>
        </form>

        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0 || pending || !email.trim()}
          className="mt-4 w-full text-center text-sm font-medium text-teal transition-colors duration-200 hover:underline disabled:text-ink-muted disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>

        <p className="mt-6 text-center text-sm text-ink-muted">
          <Link href="/login" className="text-teal font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
