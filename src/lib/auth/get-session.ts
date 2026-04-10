import type { Session, User } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";

type SessionContext = {
  session: Session | null;
  user: User | null;
  tenantId: string | null;
  role: string | null;
};

export async function getSession(): Promise<SessionContext> {
  const supabase = await createServerClient();
  const [{ data: sessionData, error: sessionError }, { data: userData, error: userError }] =
    await Promise.all([supabase.auth.getSession(), supabase.auth.getUser()]);

  if (sessionError) {
    throw sessionError;
  }

  if (userError) {
    throw userError;
  }

  const session = sessionData.session;
  const user = userData.user;

  if (!session || !user) {
    return {
      session: null,
      user: null,
      tenantId: null,
      role: null,
    };
  }

  const tenantId =
    typeof user.app_metadata?.tenant_id === "string" ? user.app_metadata.tenant_id : null;

  // Faz 0.1: Get role from users table directly, not tenant_memberships
  let role: string | null = null;

  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  role = userRow?.role ?? null;

  return {
    session,
    user,
    tenantId,
    role,
  };
}
