import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  type UIMessage,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getTools } from "@/lib/ai/tools";
import {
  saveChatMessage,
  saveChatSession,
  setChatSessionPersistError,
} from "@/lib/chat/chat-store";
import { buildChatTitle, getMessageText } from "@/lib/chat/chat-ui";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `Sen AkOs yapay zeka asistanısın. AkOs, inşaat ve proje yönetimi için AI-first bir platformdur.

Görevlerin:
- Kullanıcıların projelerini yönetmelerine yardımcı ol
- Proje oluşturma, dashboard görüntüleme gibi işlemleri tool'lar aracılığıyla yap
- Türkçe yanıt ver (kullanıcı İngilizce yazarsa İngilizce yanıt ver)
- Kısa ve net cevaplar ver
- İnşaat sektörüne özel terimleri doğru kullan

Mevcut yeteneklerin:
- createProject: Yeni proje oluşturma
- createDriveFolder: Google Drive'da proje klasor yapisi olusturma
- getDashboard: Dashboard özet verilerini getirme
- getProjectStatus: Tek bir proje icin durum ozeti getirme
- searchProjects: Projeleri arama
- listProposals: Teklifleri listeleme
- listDocuments: Dokumanlari listeleme
- getMorningBriefing: Sabah brifingi alma
- searchDocuments: Belgelerde tam metin arama yapma

Kullanıcı bir proje oluşturmak istediğinde createProject tool'unu kullan.
Kullanıcı Google Drive klasoru veya proje klasor yapisi istediginde createDriveFolder tool'unu kullan.
Kullanıcı dashboard veya genel özet istediğinde getDashboard tool'unu kullan.
Kullanici proje durumu, proje arama, teklif listesi, dokuman listesi veya sabah ozetini istediginde ilgili tool'u kullan.
Kullanıcı belge, şartname, keşif, sözleşme veya yüklenen dosyalarda arama istediğinde searchDocuments tool'unu kullan.`;

export async function POST(req: Request) {
  const supabase = await createClient();
  let persistenceFailed = false;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = typeof session.user.app_metadata?.tenant_id === "string"
    ? session.user.app_metadata.tenant_id
    : null;

  const userId = session.user.id;

  // Faz 0.1: Get role from users table, not tenant_memberships
  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const {
    messages,
    sessionId,
    title,
    projectId,
  }: {
    messages: UIMessage[];
    sessionId?: string;
    title?: string;
    projectId?: string | null;
  } = await req.json();

  // Persist incoming user message
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");

  if (sessionId && latestUserMessage) {
    try {
      await saveChatSession(supabase, {
        id: sessionId,
        tenantId,
        userId,
        title: title ?? buildChatTitle(getMessageText(latestUserMessage)),
        projectId: projectId ?? null,
      });

      await saveChatMessage(supabase, {
        sessionId,
        tenantId,
        role: "user",
        content: getMessageText(latestUserMessage),
      });
    } catch (error) {
      console.error("[CHAT_PERSIST_FAIL]", {
        sessionId,
        tenantId,
        phase: "incoming-user-message",
        error: error instanceof Error ? error.message : String(error),
      });
      persistenceFailed = true;
    }
  }

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: getTools({
      supabase,
      tenantId: tenantId ?? "",
      userId,
      role: userRow?.role ?? null,
    }),
    stopWhen: stepCountIs(3),
  });

  const response = result.toUIMessageStreamResponse({
    originalMessages: messages,
    onError(error) {
      console.error("Chat streaming failed.", error);
      return "Bir hata oluştu.";
    },
    async onFinish({ responseMessage }) {
      if (!sessionId) {
        return;
      }

      try {
        await saveChatMessage(supabase, {
          sessionId,
          tenantId,
          role: "assistant",
          content: getMessageText(responseMessage),
        });
        await setChatSessionPersistError(supabase, {
          sessionId,
          persistErrorAt: null,
        });
      } catch (error) {
        console.error("[CHAT_PERSIST_FAIL]", {
          sessionId,
          tenantId,
          phase: "assistant-message",
          error: error instanceof Error ? error.message : String(error),
        });

        try {
          await setChatSessionPersistError(supabase, {
            sessionId,
            persistErrorAt: new Date().toISOString(),
          });
        } catch (persistError) {
          console.error("[CHAT_PERSIST_FAIL_MARK]", {
            sessionId,
            tenantId,
            error:
              persistError instanceof Error
                ? persistError.message
                : String(persistError),
          });
        }
      }
    },
  });

  if (persistenceFailed) {
    response.headers.set("X-Chat-Persistence", "failed");
  }

  return response;
}
