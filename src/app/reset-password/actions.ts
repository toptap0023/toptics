"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function verifyAndReset(
  formData: FormData
): Promise<{ error?: string } | void> {
  const email = String(formData.get("email") ?? "").trim();
  const token = String(formData.get("code") ?? "").replace(/\D/g, "");
  const password = String(formData.get("password") ?? "");

  if (!email) return { error: "Enter your email." };
  if (token.length !== 6) {
    return { error: "Enter the 6-digit code from your email." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "recovery",
  });
  if (verifyError) {
    return {
      error:
        "That code is invalid or has expired. Tap “Resend code” for a new one.",
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) return { error: updateError.message };

  redirect("/dashboard");
}

export async function resendCode(
  email: string
): Promise<{ error?: string } | void> {
  const clean = email.trim();
  if (!clean) return { error: "Enter your email." };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(clean);
  if (error) return { error: error.message };
}
