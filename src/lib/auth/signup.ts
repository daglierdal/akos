"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";

type SignupInput = {
  companyName: string;
  email: string;
  name: string;
  password: string;
};

type SignupResult =
  | { success: true; tenantId: string }
  | { success: false; error: string };

function getEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function slugifyTenantName(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("tr")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function buildUniqueTenantSlug(baseName: string) {
  const supabase = createSupabaseClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY")
  );

  const baseSlug = slugifyTenantName(baseName) || "tenant";

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate =
      attempt === 0 ? baseSlug : `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;

    const { data, error } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return candidate;
    }
  }

  throw new Error("Could not generate a unique tenant slug.");
}

export async function signup({
  companyName,
  email,
  name,
  password,
}: SignupInput): Promise<SignupResult> {
  const normalizedCompanyName = companyName.trim();
  const normalizedEmail = email.trim();
  const normalizedName = name.trim();

  if (!normalizedCompanyName) {
    return { success: false, error: "Şirket adı zorunlu." };
  }

  const supabase = await createServerClient();
  const admin = createSupabaseClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY")
  );

  const slug = await buildUniqueTenantSlug(normalizedCompanyName);

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
  });

  if (signUpError || !authData.user) {
    return {
      success: false,
      error: signUpError?.message ?? "Kullanıcı oluşturulamadı.",
    };
  }

  const userId = authData.user.id;

  try {
    const { data: tenant, error: tenantError } = await admin
      .from("tenants")
      .insert({
        name: normalizedCompanyName,
        slug,
      })
      .select("id")
      .single();

    if (tenantError || !tenant) {
      throw new Error(tenantError?.message ?? "Tenant oluşturulamadı.");
    }

    const tenantId = tenant.id;

    const { error: metadataError } = await admin.auth.admin.updateUserById(userId, {
      app_metadata: {
        ...(authData.user.app_metadata ?? {}),
        tenant_id: tenantId,
      },
    });

    if (metadataError) {
      throw new Error(metadataError.message);
    }

    const { error: membershipError } = await admin.from("tenant_memberships").insert({
      tenant_id: tenantId,
      user_id: userId,
      role: "owner",
    });

    if (membershipError) {
      throw new Error(membershipError.message);
    }

    const { error: userInsertError } = await admin.from("users").insert({
      id: userId,
      tenant_id: tenantId,
      email: normalizedEmail,
      full_name: normalizedName,
      role: "admin",
    });

    if (userInsertError) {
      throw new Error(userInsertError.message);
    }

    return { success: true, tenantId };
  } catch (error) {
    await admin.auth.admin.deleteUser(userId);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Kayıt tamamlanamadı.",
    };
  }
}
