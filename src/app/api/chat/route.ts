import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { getTools } from "@/lib/ai/tools";
import { saveChatMessage, saveChatSession } from "@/lib/chat/chat-store";
import { buildChatTitle, getMessageText } from "@/lib/chat/chat-ui";
import { createServerClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `Sen AkOs yapay zeka asistanısın. AkOs, inşaat ve proje yönetimi için AI-first bir platformdur.

Görevlerin:
- Kullanıcıların projelerini yönetmelerine yardımcı ol
- Proje oluşturma, dashboard görüntüleme gibi işlemleri tool'lar aracılığıyla yap
- Türkçe yanıt ver (kullanıcı İngilizce yazarsa İngilizce yanıt ver)
- Kısa ve net cevaplar ver
- İnşaat sektörüne özel terimleri doğru kullan

Mevcut yeteneklerin:
- createProject: Yeni proje oluşturma
- getDashboard: Dashboard özet verilerini getirme

Kullanıcı bir proje oluşturmak istediğinde createProject tool'unu kullan.
Kullanıcı dashboard veya genel özet istediğinde getDashboard tool'unu kullan.`;

async function resolvePersistenceContext() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user?.email) {
    return null;
  }

  const tenantId = user.app_metadata?.tenant_id;

  if (typeof tenantId !== "string") {
    return null;
  }

  const { data: publicUser, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", user.email)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (userError) {
    throw userError;
  }

  if (!publicUser) {
    return null;
  }

  return {
    supabase,
    tenantId,
    userId: publicUser.id,
  };
}

export async function POST(req: Request) {
  const supabase = await createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.app_metadata?.tenant_id;
  if (typeof tenantId !== "string" || tenantId.length === 0) {
    return Response.json(
      { error: "Tenant context is missing from session" },
      { status: 403 }
    );
  }

  const {
    messages,
    sessionId,
    title,
  }: {
    messages: UIMessage[];
    sessionId?: string;
    title?: string;
  } = await req.json();

  let persistenceContext = null;

  try {
    persistenceContext = await resolvePersistenceContext();
  } catch (error) {
    console.error("Chat persistence context could not be resolved.", error);
  }

  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");

  if (persistenceContext && sessionId && latestUserMessage) {
    try {
      await saveChatSession(persistenceContext.supabase, {
        id: sessionId,
        tenantId: persistenceContext.tenantId,
        userId: persistenceContext.userId,
        title: title ?? buildChatTitle(getMessageText(latestUserMessage)),
      });

      await saveChatMessage(persistenceContext.supabase, {
        sessionId,
        tenantId: persistenceContext.tenantId,
        role: "user",
        content: getMessageText(latestUserMessage),
      });
    } catch (error) {
      console.error("Incoming chat message could not be persisted.", error);
    }
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: getTools({
      supabase,
      tenantId,
      userId: session.user.id,
    }),
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onError(error) {
      console.error("Chat streaming failed.", error);
      return "Bir hata oluştu.";
    },
    async onFinish({ responseMessage }) {
      if (!persistenceContext || !sessionId) {
        return;
      }

      try {
        await saveChatMessage(persistenceContext.supabase, {
          sessionId,
          tenantId: persistenceContext.tenantId,
          role: "assistant",
          content: getMessageText(responseMessage),
        });
      } catch (error) {
        console.error("Assistant chat message could not be persisted.", error);
      }
    },
  });
}
