import { describe, expect, it, vi } from "vitest";
import {
  getChatMessages,
  getLastMessageGap,
  getChatSessions,
  saveChatMessage,
  saveChatSession,
  setChatSessionPersistError,
} from "@/lib/chat/chat-store";

describe("chat-store", () => {
  it("saves a chat session with an upsert", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "session-1", title: "Merhaba" },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const upsert = vi.fn(() => ({ select }));
    const supabase = {
      from: vi.fn(() => ({ upsert })),
    } as any;

    const result = await saveChatSession(supabase, {
      id: "session-1",
      tenantId: "tenant-1",
      userId: "user-1",
      title: "Merhaba",
    });

    expect(upsert).toHaveBeenCalledWith(
      {
        id: "session-1",
        tenant_id: "tenant-1",
        user_id: "user-1",
        title: "Merhaba",
      },
      { onConflict: "id" },
    );
    expect(result).toEqual({ id: "session-1", title: "Merhaba" });
  });

  it("saves a chat message and touches the parent session", async () => {
    const insertSingle = vi.fn().mockResolvedValue({
      data: { id: "message-1", content: "Selam" },
      error: null,
    });
    const insertSelect = vi.fn(() => ({ single: insertSingle }));
    const insert = vi.fn(() => ({ select: insertSelect }));
    const updateEq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq: updateEq }));

    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "chat_messages") {
          return { insert };
        }

        if (table === "chat_sessions") {
          return { update };
        }

        throw new Error(`Unexpected table: ${table}`);
      }),
    } as any;

    const result = await saveChatMessage(supabase, {
      sessionId: "session-1",
      tenantId: "tenant-1",
      role: "user",
      content: "Selam",
    });

    expect(insert).toHaveBeenCalledWith({
      session_id: "session-1",
      tenant_id: "tenant-1",
      role: "user",
      content: "Selam",
    });
    expect(update).toHaveBeenCalled();
    expect(updateEq).toHaveBeenCalledWith("id", "session-1");
    expect(result).toEqual({ id: "message-1", content: "Selam" });
  });

  it("returns the current user's latest sessions", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { id: "user-1" },
      error: null,
    });
    const usersQuery = {
      select: vi.fn(() => usersQuery),
      eq: vi.fn(() => usersQuery),
      maybeSingle,
    };
    const limit = vi.fn().mockResolvedValue({
      data: [{ id: "session-1", title: "Baslik" }],
      error: null,
    });
    const sessionsQuery = {
      select: vi.fn(() => sessionsQuery),
      eq: vi.fn(() => sessionsQuery),
      order: vi.fn(() => sessionsQuery),
      limit,
    };
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              email: "test@example.com",
              app_metadata: { tenant_id: "tenant-1" },
            },
          },
          error: null,
        }),
      },
      from: vi.fn((table: string) => {
        if (table === "users") {
          return usersQuery;
        }

        if (table === "chat_sessions") {
          return sessionsQuery;
        }

        throw new Error(`Unexpected table: ${table}`);
      }),
    } as any;

    const result = await getChatSessions(supabase);

    expect(result).toEqual([{ id: "session-1", title: "Baslik" }]);
    expect(sessionsQuery.eq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("updates the chat session persist error timestamp", async () => {
    const updateEq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq: updateEq }));
    const supabase = {
      from: vi.fn(() => ({ update })),
    } as any;

    await setChatSessionPersistError(supabase, {
      sessionId: "session-1",
      persistErrorAt: "2026-04-05T12:00:00.000Z",
    });

    expect(update).toHaveBeenCalledWith({
      persist_error_at: "2026-04-05T12:00:00.000Z",
    });
    expect(updateEq).toHaveBeenCalledWith("id", "session-1");
  });

  it("returns the gap between expected and persisted message counts", async () => {
    const eq = vi.fn().mockResolvedValue({
      count: 2,
      error: null,
    });
    const select = vi.fn(() => ({ eq }));
    const supabase = {
      from: vi.fn(() => ({ select })),
    } as any;

    const result = await getLastMessageGap(supabase, "session-1", 3);

    expect(select).toHaveBeenCalledWith("*", { count: "exact", head: true });
    expect(eq).toHaveBeenCalledWith("session_id", "session-1");
    expect(result).toBe(1);
  });

  it("returns the messages of a session in ascending order", async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{ id: "message-1", role: "user", content: "Selam" }],
      error: null,
    });
    const query = {
      select: vi.fn(() => query),
      eq: vi.fn(() => query),
      order,
    };
    const supabase = {
      from: vi.fn(() => query),
    } as any;

    const result = await getChatMessages(supabase, "session-1");

    expect(query.eq).toHaveBeenCalledWith("session_id", "session-1");
    expect(order).toHaveBeenCalledWith("created_at", { ascending: true });
    expect(result).toEqual([{ id: "message-1", role: "user", content: "Selam" }]);
  });
});
