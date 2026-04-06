export type MembershipRole = string | null | undefined;

function isAdminRole(role: MembershipRole) {
  return role === "admin" || role === "owner";
}

export function canCreateProject(role: MembershipRole) {
  return isAdminRole(role);
}

export function canSubmitProposal(role: MembershipRole) {
  return isAdminRole(role);
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
