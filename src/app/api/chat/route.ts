import { streamText, tool, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

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
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: SYSTEM_PROMPT,
    messages,
    tools: {
      createProject: tool({
        description:
          "Yeni bir proje oluşturur. Proje adı ve müşteri zorunludur, bütçe ve açıklama opsiyoneldir.",
        inputSchema: z.object({
          name: z.string().min(1).describe("Proje adı"),
          customer: z.string().min(1).describe("Müşteri adı"),
          budget: z.number().positive().optional().describe("Bütçe (TL)"),
          description: z
            .string()
            .optional()
            .describe("Proje açıklaması"),
        }),
        execute: async (params) => {
          // TODO: Supabase entegrasyonu — proje veritabanına kaydedilecek
          const project = {
            id: crypto.randomUUID(),
            name: params.name,
            customer: params.customer,
            budget: params.budget ?? null,
            description: params.description ?? null,
            createdAt: new Date().toISOString(),
          };
          return { success: true, project };
        },
      }),
      getDashboard: tool({
        description:
          "Dashboard özet verilerini getirir: aktif projeler, müşteri sayısı, bekleyen teklifler ve son aktiviteler.",
        inputSchema: z.object({
          period: z
            .enum(["week", "month", "quarter", "year"])
            .default("month")
            .describe("Özet dönemi"),
        }),
        execute: async (params) => {
          // TODO: Supabase entegrasyonu — gerçek veriler çekilecek
          return {
            success: true,
            summary: {
              activeProjects: 0,
              totalCustomers: 0,
              pendingProposals: 0,
              recentActivities: [],
              period: params.period,
            },
          };
        },
      }),
    },
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
