import { ChatPageClient } from "@/components/chat/chat-page-client";
import { getChatMessages, getChatSessions } from "@/lib/chat/chat-store";
import {
  toChatSessionListItem,
  toUIMessage,
  type ChatSessionListItem,
} from "@/lib/chat/chat-ui";
import { createClient } from "@/lib/supabase/server";
import type { UIMessage } from "ai";

export default async function ChatPage({
  searchParams,
}: {
  searchParams?: Promise<{ projectId?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const selectedProjectId = params?.projectId ?? null;

  let initialSessions: ChatSessionListItem[] = [];
  let initialMessages: UIMessage[] = [];

  try {
    initialSessions = (await getChatSessions(supabase, selectedProjectId)).map(
      toChatSessionListItem,
    );
  } catch (error) {
    console.error("Initial chat sessions could not be loaded.", error);
  }

  const initialSessionId = initialSessions[0]?.id ?? null;

  if (initialSessionId) {
    try {
      initialMessages = (await getChatMessages(supabase, initialSessionId)).map(
        toUIMessage,
      );
    } catch (error) {
      console.error("Initial chat messages could not be loaded.", error);
    }
  }

  return (
    <ChatPageClient
      initialSessions={initialSessions}
      initialSessionId={initialSessionId}
      initialMessages={initialMessages}
      selectedProjectId={selectedProjectId}
    />
  );
}
