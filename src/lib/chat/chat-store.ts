import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type DbClient = SupabaseClient<Database>;

export type ChatSessionRow = Database["public"]["Tables"]["chat_sessions"]["Row"];
export type ChatMessageRow = Database["public"]["Tables"]["chat_messages"]["Row"];

interface SaveChatSessionInput {
  id?: string;
  userId: string;
  title?: string | null;
  projectId?: string | null;
}

interface SaveChatMessageInput {
  sessionId: string;
  role: ChatMessageRow["role"];
  content: string;
}

interface SetChatSessionPersistErrorInput {
  sessionId: string;
  persistErrorAt: string | null;
}

async function resolveCurrentUserId(supabase: DbClient) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    return null;
  }

  return user.id;
}

export async function saveChatSession(
  supabase: DbClient,
  { id, userId, title, projectId }: SaveChatSessionInput,
) {
  const payload: Database["public"]["Tables"]["chat_sessions"]["Insert"] = {
    id,
    tenant_id: userId, // TODO: remove tenant_id after DB migration (using userId as placeholder)
    user_id: userId,
    title: title ?? null,
    project_id: projectId ?? null,
  };

  const { data, error } = await supabase
    .from("chat_sessions")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function saveChatMessage(
  supabase: DbClient,
  { sessionId, role, content }: SaveChatMessageInput,
) {
  const normalizedContent = content.trim();

  if (!normalizedContent) {
    return null;
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      session_id: sessionId,
      tenant_id: sessionId, // TODO: remove tenant_id after DB migration
      role,
      content: normalizedContent,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  const { error: touchError } = await supabase
    .from("chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (touchError) {
    throw touchError;
  }

  return data;
}

export async function setChatSessionPersistError(
  supabase: DbClient,
  { sessionId, persistErrorAt }: SetChatSessionPersistErrorInput,
) {
  const { error } = await supabase
    .from("chat_sessions")
    .update({ persist_error_at: persistErrorAt })
    .eq("id", sessionId);

  if (error) {
    throw error;
  }
}

export async function getChatSessions(
  supabase: DbClient,
  projectId: string | null = null,
) {
  const userId = await resolveCurrentUserId(supabase);

  if (!userId) {
    return [];
  }

  const baseQuery = supabase
    .from("chat_sessions")
    .select(
      "id, title, created_at, updated_at, user_id, tenant_id, project_id, persist_error_at",
    )
    .eq("user_id", userId);

  const { data, error } = projectId
    ? await baseQuery
        .eq("project_id", projectId)
        .order("updated_at", { ascending: false })
        .limit(50)
    : await baseQuery
        .is("project_id", null)
        .order("updated_at", { ascending: false })
        .limit(50);

  if (error) {
    throw error;
  }

  return data;
}

export async function getLastMessageGap(
  supabase: DbClient,
  sessionId: string,
  expectedCount: number,
) {
  if (expectedCount <= 0) {
    return 0;
  }

  const { count, error } = await supabase
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId);

  if (error) {
    throw error;
  }

  return Math.max(0, expectedCount - (count ?? 0));
}

export async function getChatMessages(supabase: DbClient, sessionId: string) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select(
      "id, session_id, tenant_id, role, content, metadata, created_at, updated_at",
    )
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}
