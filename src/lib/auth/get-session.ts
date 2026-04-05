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

  let role: string | null = null;

  if (tenantId) {
    const { data: membership, error: membershipError } = await supabase
      .from("tenant_memberships")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipError) {
      throw membershipError;
    }

    role = membership?.role ?? null;
  }

  return {
    session,
    user,
    tenantId,
    role,
  };
}
