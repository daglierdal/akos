"use client";

import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ChatSessionListItem } from "@/lib/chat/chat-ui";

interface ChatSidebarProps {
  sessions: ChatSessionListItem[];
  activeSessionId: string | null;
  contextLabel?: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  contextLabel,
  onSelectSession,
  onNewSession,
}: ChatSidebarProps) {
  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center justify-between border-b border-sidebar-border p-3">
        <h2 className="text-sm font-semibold text-sidebar-foreground">
          Sohbetler
        </h2>
        {contextLabel ? (
          <span className="rounded-full bg-sidebar-accent px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-sidebar-accent-foreground">
            {contextLabel}
          </span>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onNewSession}
          title="Yeni Sohbet"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {sessions.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              Henüz sohbet yok. Yeni bir sohbet başlatın.
            </p>
          )}
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={cn(
                "group flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                activeSessionId === session.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{session.title}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
