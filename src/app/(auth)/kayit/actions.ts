"use server";

import { redirect } from "next/navigation";
import { signup } from "@/lib/auth/signup";
import { createClient } from "@/lib/supabase/server";

export type SignupActionState = {
  error: string | null;
};

export async function signupAction(
  _prevState: SignupActionState,
  formData: FormData
): Promise<SignupActionState> {
  const companyName = String(formData.get("companyName") ?? "");
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password !== confirmPassword) {
    return { error: "Şifreler eşleşmiyor" };
  }

  const result = await signup({
    companyName,
    email,
    name,
    password,
  });

  if (!result.success) {
    return { error: result.error };
  }

  const supabase = await createClient();
  const { error: refreshError } = await supabase.auth.refreshSession();

  if (refreshError) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return { error: signInError.message };
    }
  }

  redirect("/dashboard");
}
