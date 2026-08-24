import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

const PUBLIC_PATHS = [
  "/api/keep-alive",
  "/login",
  "/auth",
  "/forgot-password",
  "/reset-password",
];

// Middleware runs on every navigation and a stalled Supabase call takes the
// whole app down with a Vercel 504 (MIDDLEWARE_INVOCATION_TIMEOUT), so the
// auth call gets a hard deadline well under that limit.
const AUTH_TIMEOUT_MS = 3000;

// @supabase/ssr stores the session in sb-<project-ref>-auth-token (chunked as
// .0/.1 when large). The PKCE code verifier shares the prefix but is not a
// session, so it must not count as one.
function hasSessionCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.startsWith("sb-") &&
        cookie.name.includes("-auth-token") &&
        !cookie.name.includes("code-verifier")
    );
}

// A call that times out and a call that fails mean different things: the first
// says "auth is slow right now", the second says "this session is no good".
const TIMED_OUT = "auth-deadline" as const;
const FAILED = "auth-failed" as const;

async function withDeadline<T>(promise: Promise<T>, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  const deadline = new Promise<typeof TIMED_OUT>((resolve) => {
    timer = setTimeout(() => resolve(TIMED_OUT), ms);
  });
  try {
    // The catch has to be attached to the promise itself, not to the race, or
    // a rejection arriving after the deadline goes unhandled.
    return await Promise.race([
      promise.catch((): typeof FAILED => FAILED),
      deadline,
    ]);
  } finally {
    clearTimeout(timer!);
  }
}

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));

  // Signed-out visitors are the common case on a cold edge instance. Decide
  // without touching the network so Supabase can never stall the response.
  if (!hasSessionCookie(request)) {
    if (isPublic) return NextResponse.next({ request });
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: do not run code between createServerClient and getClaims().
  // getClaims() verifies the JWT locally against the project's cached JWKS
  // (no Supabase Auth round-trip per navigation, unlike getUser). Expired
  // sessions still refresh via getSession() inside it, so @supabase/ssr keeps
  // writing refreshed cookies; legacy HS256 tokens fall back to a server call.
  const result = await withDeadline(supabase.auth.getClaims(), AUTH_TIMEOUT_MS);

  // Deadline hit: the request already carries a session cookie, so let it
  // through instead of 504-ing or bouncing a signed-in user to /login. Row
  // Level Security still gates every row the page can read.
  if (result === TIMED_OUT) return response;

  const user = result === FAILED ? null : result.data?.claims ?? null;

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
