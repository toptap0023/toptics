import Link from "next/link";
import { signIn, signUp } from "./actions";
import { BrandMark } from "@/components/icons";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; error?: string; message?: string }>;
}) {
  const { mode, error, message } = await searchParams;
  const isSignup = mode === "signup";

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-5 py-12 pt-safe pb-safe">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-black border-2 border-white grid place-items-center shadow-glow">
            <BrandMark className="w-9 h-9" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
TOP<span className="text-teal">tics</span>
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {isSignup
              ? "Create an account to start tracking."
              : "Sign in to your personal finance tracker."}
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

        <form className="flex flex-col gap-4">
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

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-ink-muted"
              >
                Password
              </label>
              {!isSignup ? (
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-teal hover:underline"
                >
                  Forgot?
                </Link>
              ) : null}
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={6}
              placeholder="••••••••"
              className="rounded-xl bg-bg-panel border border-line px-4 py-3 text-ink placeholder:text-ink-muted/60 focus:border-teal"
            />
          </div>

          <button
            formAction={isSignup ? signUp : signIn}
            className="mt-2 rounded-xl bg-teal px-4 py-3.5 font-semibold text-bg shadow-glow transition-colors duration-200 hover:bg-teal-dark active:bg-teal-dark cursor-pointer"
          >
            {isSignup ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-teal font-medium hover:underline">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link
                href="/login?mode=signup"
                className="text-teal font-medium hover:underline"
              >
                Create an account
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
