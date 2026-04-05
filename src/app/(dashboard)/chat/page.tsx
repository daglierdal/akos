"use client";

import { useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { ChatSidebar, type ChatSession } from "@/components/chat/chat-sidebar";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { ResultPanel } from "@/components/chat/result-panel";
import { PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => [
    { id: "default", title: "Yeni Sohbet", createdAt: new Date() },
  ]);
  const [activeSessionId, setActiveSessionId] = useState("default");
  const [resultPanelOpen, setResultPanelOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const { messages, sendMessage, status, setMessages } = useChat({
    id: activeSessionId,
    onFinish() {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId && s.title === "Yeni Sohbet") {
            const firstUserMsg = messages.find((m) => m.role === "user");
            if (firstUserMsg) {
              const textPart = firstUserMsg.parts.find(
                (p) => p.type === "text"
              );
              if (textPart && "text" in textPart) {
                const text = textPart.text;
                return {
                  ...s,
                  title: text.length > 40 ? text.slice(0, 40) + "..." : text,
                };
              }
            }
          }
          return s;
        })
      );
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const text = inputValue.trim();
    setInputValue("");

    // Update title from first message
    if (messages.length === 0) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                title: text.length > 40 ? text.slice(0, 40) + "..." : text,
              }
            : s
        )
      );
    }

    sendMessage({ text });
  }

  const handleNewSession = useCallback(() => {
    const id = generateId();
    setSessions((prev) => [
      { id, title: "Yeni Sohbet", createdAt: new Date() },
      ...prev,
    ]);
    setActiveSessionId(id);
    setMessages([]);
    setInputValue("");
  }, [setMessages]);

  const handleSelectSession = useCallback(
    (id: string) => {
      setActiveSessionId(id);
      setMessages([]);
      setInputValue("");
    },
    [setMessages]
  );

  const handleDeleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        if (filtered.length === 0) {
          const newSession: ChatSession = {
            id: generateId(),
            title: "Yeni Sohbet",
            createdAt: new Date(),
          };
          if (id === activeSessionId) {
            setActiveSessionId(newSession.id);
            setMessages([]);
            setInputValue("");
          }
          return [newSession];
        }
        if (id === activeSessionId) {
          setActiveSessionId(filtered[0].id);
          setMessages([]);
          setInputValue("");
        }
        return filtered;
      });
    },
    [activeSessionId, setMessages]
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
      />

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <h1 className="text-sm font-medium text-muted-foreground">
            {sessions.find((s) => s.id === activeSessionId)?.title ?? "Sohbet"}
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
