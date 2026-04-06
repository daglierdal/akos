import { z } from "zod";
import { assertPermission, canViewAllProjects } from "@/lib/auth/permissions";
import { defineTool, type ToolContext } from "./tool-definition";

const parameters = z.object({});

const ACTIVE_PROJECT_STATUSES = [
  "teklif_asamasi",
  "kabul_edildi",
  "basladi",
  "devam_ediyor",
] as const;

export const getMorningBriefing = defineTool({
  name: "getMorningBriefing",
  description:
    "Sabah ozeti getirir: aktif proje sayisi, bekleyen teklifler ve bugunun isleri.",
  parameters,
  execute: async (_params, context: ToolContext) => {
    assertPermission(
      canViewAllProjects(context.role),
      "Sabah brifingi goruntuleme yetkiniz yok.",
    );

    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);

    const [
      { count: activeProjectCount, error: activeProjectsError },
      { count: pendingProposalCount, error: proposalCountError },
      { data: todaysDocuments, error: documentsError },
      { data: todaysProposals, error: proposalsError },
    ] = await Promise.all([
      context.supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .in("status", [...ACTIVE_PROJECT_STATUSES]),
      context.supabase
        .from("proposals")
        .select("*", { count: "exact", head: true })
        .in("status", ["draft", "pending"]),
      context.supabase
        .from("documents")
        .select("id, title, original_filename, updated_at")
        .gte("updated_at", dayStart.toISOString())
        .order("updated_at", { ascending: false })
        .limit(5),
      context.supabase
        .from("proposals")
        .select("id, revision_code, status, updated_at")
        .gte("updated_at", dayStart.toISOString())
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);

    const firstError =
      activeProjectsError ?? proposalCountError ?? documentsError ?? proposalsError;
    if (firstError) {
      throw new Error(`Morning briefing failed: ${firstError.message}`);
    }

    const todaysTasks = [
      ...(todaysDocuments ?? []).map((document) => ({
        id: document.id,
        type: "document",
        text:
          document.title?.trim() || document.original_filename?.trim() || "Dokuman guncellendi",
        updatedAt: document.updated_at,
      })),
      ...(todaysProposals ?? []).map((proposal) => ({
        id: proposal.id,
        type: "proposal",
        text: `${proposal.revision_code} / ${proposal.status}`,
        updatedAt: proposal.updated_at,
      })),
    ]
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .slice(0, 8);

    return {
      success: true,
      summary: {
        activeProjectCount: activeProjectCount ?? 0,
        pendingProposalCount: pendingProposalCount ?? 0,
        todaysTasks,
        generatedAt: now.toISOString(),
      },
    };
  },
});
