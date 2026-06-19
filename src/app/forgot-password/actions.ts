"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requestReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    redirect(
      "/forgot-password?error=" + encodeURIComponent("Enter your email.")
    );
  }

  const supabase = await createClient();
  // Sends the recovery email. With the email template showing {{ .Token }},
  // this delivers a 6-digit code the user types on /reset-password.
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    redirect("/forgot-password?error=" + encodeURIComponent(error.message));
  }
  redirect(
    "/reset-password?email=" + encodeURIComponent(email) + "&sent=1"
  );
}
