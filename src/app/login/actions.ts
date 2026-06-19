"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Best-effort site origin for email redirect links. */
async function siteOrigin() {
  const hdrs = await headers();
  const fromOrigin = hdrs.get("origin");
  if (fromOrigin) return fromOrigin;
  const host = hdrs.get("host") ?? "localhost:3000";
  const proto =
    host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https";
  return `${proto}://${host}`;
}

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

export async function signIn(formData: FormData) {
  const { email, password } = readCredentials(formData);
  if (!email || !password) {
    redirect("/login?error=" + encodeURIComponent("Enter your email and password."));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const { email, password } = readCredentials(formData);
  if (!email || !password) {
    redirect("/login?mode=signup&error=" + encodeURIComponent("Enter your email and password."));
  }
  if (password.length < 6) {
    redirect(
      "/login?mode=signup&error=" +
        encodeURIComponent("Password must be at least 6 characters.")
    );
  }

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/dashboard` },
  });

  if (error) {
    redirect("/login?mode=signup&error=" + encodeURIComponent(error.message));
  }

  // If email confirmation is OFF, a session is returned and we go straight in.
  if (data.session) {
    redirect("/dashboard");
  }
  // Otherwise the user must confirm via email first.
  redirect(
    "/login?message=" +
      encodeURIComponent("Check your inbox to confirm your email, then sign in.")
  );
}
