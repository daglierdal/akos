"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { PanelRight } from "lucide-react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { BoqImportWizard } from "@/components/boq/boq-import-wizard";
import { BoqTable } from "@/components/boq/boq-table";
import { PriceSuggestionPanel } from "@/components/boq/price-suggestion-panel";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { ProjectPanel } from "@/components/panels/project-panel";
import { SidePanel } from "@/components/panels/side-panel";
import { ProposalSummary } from "@/components/proposals/proposal-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import {
  getChatMessages,
  getChatSessions,
  getLastMessageGap,
} from "@/lib/chat/chat-store";
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
  selectedProjectId: string | null;
}

export function ChatPageClient({
  initialMessages,
  initialSessionId,
  initialSessions,
  selectedProjectId,
}: ChatPageClientProps) {
  const supabaseRef = useRef(createClient());
  const [requestPersistenceWarning, setRequestPersistenceWarning] =
    useState(false);
  const [sessionPersistenceWarning, setSessionPersistenceWarning] =
    useState(false);
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
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: async (input, init) => {
        const response = await fetch(input, init);
        setRequestPersistenceWarning(
          response.headers.get("X-Chat-Persistence") === "failed",
        );
        return response;
      },
    }),
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

  useEffect(() => {
    if (isLoadingSession || status === "submitted" || status === "streaming") {
      return;
    }

    let isCancelled = false;

    async function syncPersistenceWarning() {
      const activeSession = sessions.find((session) => session.id === activeSessionId);
      const persistErrorAt = activeSession?.persistErrorAt;
      const isRecentPersistError =
        typeof persistErrorAt === "string" &&
        Date.now() - new Date(persistErrorAt).getTime() <= 5 * 60 * 1000;

      if (!isRecentPersistError || messages.length === 0) {
        if (!isCancelled) {
          setSessionPersistenceWarning(false);
        }
        return;
      }

      try {
        const gap = await getLastMessageGap(
          supabaseRef.current,
          activeSessionId,
          messages.length,
        );

        if (!isCancelled) {
          setSessionPersistenceWarning(gap > 0);
        }
      } catch (error) {
        console.error("Chat persistence state could not be checked.", error);

        if (!isCancelled) {
          setSessionPersistenceWarning(isRecentPersistError);
        }
      }
    }

    void syncPersistenceWarning();

    return () => {
      isCancelled = true;
    };
  }, [activeSessionId, isLoadingSession, messages.length, sessions, status]);

  async function refreshSessions() {
    try {
      const nextSessions = await getChatSessions(
        supabaseRef.current,
        selectedProjectId,
      );
      setSessions(nextSessions.map(toChatSessionListItem));
    } catch (error) {
      console.error("Chat sessions could not be loaded.", error);
    }
  }

  async function handleSelectSession(id: string) {
    setActiveSessionId(id);
    setInputValue("");
    setRequestPersistenceWarning(false);

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
    setRequestPersistenceWarning(false);
    setSessionPersistenceWarning(false);
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
          persistErrorAt: null,
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
    setRequestPersistenceWarning(false);
    setSessionPersistenceWarning(false);

    await sendMessage(
      { text },
      {
        body: {
          sessionId: activeSessionId,
          title,
          projectId: selectedProjectId,
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

  const mainContent = (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex min-w-0 flex-col">
          <h1 className="truncate text-sm font-medium text-muted-foreground">
            {activeTitle}
          </h1>
          {requestPersistenceWarning || sessionPersistenceWarning ? (
            <p className="text-xs text-amber-600">
              Son mesaj kaydedilemedi.
            </p>
          ) : null}
        </div>
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
  );

  const boqPanel = (
    <div className="space-y-4 p-4">
      <BoqImportWizard />
      <PriceSuggestionPanel />
      <BoqTable />
    </div>
  );

  const teklifPanel = <ProposalSummary />;

  const projectInfoPanel = <ProjectPanel projectId={selectedProjectId} />;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        contextLabel={selectedProjectId ? "Proje" : "Genel"}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
      />
      <div className="min-w-0 flex-1">
        <SidePanel
          main={mainContent}
          open={resultPanelOpen}
          onOpenChange={setResultPanelOpen}
          boq={boqPanel}
          proposal={teklifPanel}
          projectInfo={projectInfoPanel}
        />
      </div>
    </div>
  );
}
