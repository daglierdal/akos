import { streamText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getTools } from "@/lib/ai/tools";

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

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Route handlers can safely ignore cookie write failures here.
          }
        },
      },
    }
  );

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

  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: SYSTEM_PROMPT,
    messages,
    tools: getTools({
      supabase,
      tenantId,
      userId: session.user.id,
    }),
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
