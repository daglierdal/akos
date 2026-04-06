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

export async function getTenantMembershipRole(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  userId: string,
): Promise<MembershipRole> {
  const { data: membership, error } = await supabase
    .from("tenant_memberships")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Uyelik rolu alinmadi: ${error.message}`);
  }

  return membership?.role;
}

export async function assertTenantPermission(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  userId: string,
  check: (role: MembershipRole) => boolean,
  message = "Bu islem icin yetkiniz yok.",
) {
  const role = await getTenantMembershipRole(supabase, tenantId, userId);
  assertPermission(check(role), message);
}
