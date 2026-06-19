import Link from "next/link";
import { requestReset } from "./actions";
import { BrandMark } from "@/components/icons";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-5 py-12 pt-safe pb-safe">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-black border-2 border-white grid place-items-center shadow-glow">
            <BrandMark className="w-9 h-9" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            Reset password
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Enter your email and we&apos;ll send you a reset link.
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
        {message ? (
          <div
            role="status"
            className="mb-4 rounded-xl border border-teal/40 bg-teal/10 px-4 py-3 text-sm text-teal-light"
          >
            {message}
          </div>
        ) : null}

        <form action={requestReset} className="flex flex-col gap-4">
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
              placeholder="you@example.com"
              className="rounded-xl bg-bg-panel border border-line px-4 py-3 text-ink placeholder:text-ink-muted/60 focus:border-teal"
            />
          </div>
          <button
            type="submit"
            className="mt-2 rounded-xl bg-teal px-4 py-3.5 font-semibold text-bg shadow-glow transition-colors duration-200 hover:bg-teal-dark cursor-pointer"
          >
            Send reset link
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          <Link href="/login" className="text-teal font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
