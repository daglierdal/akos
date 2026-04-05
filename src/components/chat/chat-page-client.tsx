"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { PanelRight } from "lucide-react";
import type { UIMessage } from "ai";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { ResultPanel } from "@/components/chat/result-panel";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getChatMessages, getChatSessions } from "@/lib/chat/chat-store";
import {
  buildChatTitle,
  createChatSessionId,
  toChatSessionListItem,
  toUIMessage,
  type ChatSessionListItem,
} from "@/lib/chat/chat-ui";

interface ChatPageClientProps {
  initialMessages: UIMessage[];
  initialSessionId: string | null;
  initialSessions: ChatSessionListItem[];
}

export function ChatPageClient({
  initialMessages,
  initialSessionId,
  initialSessions,
}: ChatPageClientProps) {
  const supabaseRef = useRef(createClient());
  const [sessions, setSessions] = useState(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState(
    initialSessionId ?? createChatSessionId(),
  );
  const [messageCache, setMessageCache] = useState<Record<string, UIMessage[]>>(
    () => (initialSessionId ? { [initialSessionId]: initialMessages } : {}),
  );
  const [resultPanelOpen, setResultPanelOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  const { messages, sendMessage, setMessages, status } = useChat({
    id: activeSessionId,
    onFinish: async () => {
      await refreshSessions();
    },
  });

  const isLoading =
    status === "submitted" || status === "streaming" || isLoadingSession;

  useEffect(() => {
    if (!initialSessionId) {
      setMessages([]);
      return;
    }

    if (activeSessionId === initialSessionId) {
      setMessages(initialMessages);
    }
  }, [activeSessionId, initialMessages, initialSessionId, setMessages]);

  useEffect(() => {
    setMessageCache((current) => ({
      ...current,
      [activeSessionId]: messages,
    }));
  }, [activeSessionId, messages]);

  async function refreshSessions() {
    try {
      const nextSessions = await getChatSessions(supabaseRef.current);
      setSessions(nextSessions.map(toChatSessionListItem));
    } catch (error) {
      console.error("Chat sessions could not be loaded.", error);
    }
  }

  async function handleSelectSession(id: string) {
    setActiveSessionId(id);
    setInputValue("");

    const cachedMessages = messageCache[id];
    if (cachedMessages) {
      setMessages(cachedMessages);
      return;
    }

    setIsLoadingSession(true);

    try {
      const nextMessages = await getChatMessages(supabaseRef.current, id);
      const uiMessages = nextMessages.map(toUIMessage);
      setMessageCache((current) => ({
        ...current,
        [id]: uiMessages,
      }));
      setMessages(uiMessages);
    } catch (error) {
      console.error("Chat messages could not be loaded.", error);
      setMessages([]);
    } finally {
      setIsLoadingSession(false);
    }
  }

  function handleNewSession() {
    const nextId = createChatSessionId();
    setActiveSessionId(nextId);
    setInputValue("");
    setMessages([]);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const text = inputValue.trim();

    if (!text || isLoading) {
      return;
    }

    const title = buildChatTitle(text);
    const hasSession = sessions.some((session) => session.id === activeSessionId);

    if (!hasSession) {
      setSessions((current) => [
        {
          id: activeSessionId,
          title,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...current,
      ]);
    } else {
      setSessions((current) =>
        current.map((session) =>
          session.id === activeSessionId && session.title === "Yeni Sohbet"
            ? {
                ...session,
                title,
              }
            : session,
        ),
      );
    }

    setInputValue("");

    await sendMessage(
      { text },
      {
        body: {
          sessionId: activeSessionId,
          title,
        },
      },
    );
  }

  useEffect(() => {
    void refreshSessions();
  }, []);

  const activeTitle =
    sessions.find((session) => session.id === activeSessionId)?.title ??
    "Yeni Sohbet";

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
      />

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <h1 className="text-sm font-medium text-muted-foreground">
            {activeTitle}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setResultPanelOpen(!resultPanelOpen)}
            title={resultPanelOpen ? "Paneli Kapat" : "Sonuç Paneli"}
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        </div>

        <ChatMessages messages={messages} isLoading={isLoading} />
        <ChatInput
          input={inputValue}
          isLoading={isLoading}
          onInputChange={setInputValue}
          onSubmit={handleSubmit}
        />
      </div>

      <ResultPanel
        isOpen={resultPanelOpen}
        onClose={() => setResultPanelOpen(false)}
      />
    </div>
  );
}
