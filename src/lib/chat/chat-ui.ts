import type { UIMessage } from "ai";
import type { ChatMessageRow, ChatSessionRow } from "@/lib/chat/chat-store";

export interface ChatSessionListItem {
  createdAt: string;
  id: string;
  persistErrorAt: string | null;
  title: string;
  updatedAt: string;
}

export function createChatSessionId() {
  return crypto.randomUUID();
}

export function buildChatTitle(content: string) {
  const normalized = content.trim();

  if (!normalized) {
    return "Yeni Sohbet";
  }

  return normalized.length > 40 ? `${normalized.slice(0, 40)}...` : normalized;
}

export function getMessageText(
  message: Pick<UIMessage, "parts"> | Pick<ChatMessageRow, "content">,
) {
  if ("content" in message) {
    return message.content;
  }

  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export function toChatSessionListItem(session: ChatSessionRow): ChatSessionListItem {
  return {
    id: session.id,
    persistErrorAt: session.persist_error_at,
    title: session.title?.trim() || "Yeni Sohbet",
    createdAt: session.created_at,
    updatedAt: session.updated_at,
  };
}

export function toUIMessage(message: ChatMessageRow): UIMessage {
  return {
    id: message.id,
    role: message.role,
    parts: [
      {
        type: "text",
        text: message.content,
      },
    ],
  };
}
