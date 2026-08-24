import { NextResponse } from "next/server";

// Supabase auto-pauses a free project after 7 days with no activity, and a
// paused project breaks login. This app is used a few times a month, so a
// daily cron (vercel.json > crons, plus .github/workflows/backup.yml) hits
// this route to keep the project awake between real visits.
//
// It runs one trivial PostgREST read so Postgres itself sees traffic. RLS
// gives the anon key zero rows, so nothing is exposed either way.

export const dynamic = "force-dynamic";

const TIMEOUT_MS = 5000;

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { ok: false, error: "supabase env vars missing" },
      { status: 500 }
    );
  }

  const startedAt = Date.now();

  try {
    const res = await fetch(`${url}/rest/v1/transactions?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const ms = Date.now() - startedAt;

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, status: res.status, ms },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true, ms });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        ms: Date.now() - startedAt,
        error: error instanceof Error ? error.message : "unknown error",
      },
      { status: 503 }
    );
  }
}
