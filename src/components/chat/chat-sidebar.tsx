"use client";

import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: ChatSidebarProps) {
  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center justify-between border-b border-sidebar-border p-3">
        <h2 className="text-sm font-semibold text-sidebar-foreground">
          Sohbetler
        </h2>
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="hidden shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive group-hover:block"
                title="Sil"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
