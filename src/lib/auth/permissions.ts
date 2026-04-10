import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type MembershipRole = string | null | undefined;

function isAdminRole(role: MembershipRole) {
  return role === "admin" || role === "owner";
}

function isTenantProjectWriterRole(role: MembershipRole) {
  return isAdminRole(role) || role === "user";
}

export function canCreateProject(role: MembershipRole) {
  return isAdminRole(role);
}

export function canCreateProposal(role: MembershipRole) {
  return isTenantProjectWriterRole(role);
}

export function canSubmitProposal(role: MembershipRole) {
  return isAdminRole(role);
}

export function canImportBOQ(role: MembershipRole) {
  return isTenantProjectWriterRole(role);
}

export function canImportPriceList(role: MembershipRole) {
  return isAdminRole(role);
}

export function canUploadDocument(role: MembershipRole) {
  return isTenantProjectWriterRole(role);
}

export function canEditBOQ(role: MembershipRole) {
  return isTenantProjectWriterRole(role);
}

export function canDeleteProject(role: MembershipRole) {
  return isAdminRole(role);
}

export function canViewAllProjects(role: MembershipRole) {
  return isAdminRole(role);
}

export function assertPermission(
  allowed: boolean,
  message = "Bu islem icin yetkiniz yok.",
) {
  if (!allowed) {
    throw new Error(message);
  }
}

// Faz 0.1: Get role from users table, not tenant_memberships (single tenant)
export async function getUserRole(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<MembershipRole> {
  const { data: userRow, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Kullanici rolu alinmadi: ${error.message}`);
  }

  return userRow?.role;
}

// Keep old signature for compatibility — ignores tenantId, queries users table
export async function getTenantMembershipRole(
  supabase: SupabaseClient<Database>,
  _tenantId: string,
  userId: string,
): Promise<MembershipRole> {
  return getUserRole(supabase, userId);
}

export async function assertTenantPermission(
  supabase: SupabaseClient<Database>,
  _tenantId: string,
  userId: string,
  check: (role: MembershipRole) => boolean,
  message = "Bu islem icin yetkiniz yok.",
) {
  const role = await getUserRole(supabase, userId);
  assertPermission(check(role), message);
}
