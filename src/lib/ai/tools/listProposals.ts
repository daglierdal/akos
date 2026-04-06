import { z } from "zod";
import { assertPermission, canViewAllProjects } from "@/lib/auth/permissions";
import { defineTool, type ToolContext } from "./tool-definition";

const parameters = z.object({
  projectId: z.string().uuid().optional().describe("Opsiyonel proje ID"),
  status: z.string().optional().describe("Teklif durumu"),
  startDate: z.string().optional().describe("Baslangic tarihi (YYYY-MM-DD)"),
  endDate: z.string().optional().describe("Bitis tarihi (YYYY-MM-DD)"),
});

export const listProposals = defineTool({
  name: "listProposals",
  description:
    "Teklifleri proje, durum ve tarih araligina gore listeler.",
  parameters,
  execute: async (params, context: ToolContext) => {
    assertPermission(
      canViewAllProjects(context.role),
      "Teklifleri listeleme yetkiniz yok.",
    );

    let query = context.supabase
      .from("proposals")
      .select(
        "id, project_id, revision_no, revision_code, status, total_cost, total_price, total_vat, submitted_at, created_at, updated_at",
      )
      .order("updated_at", { ascending: false })
      .limit(100);

    if (params.projectId) {
      query = query.eq("project_id", params.projectId);
    }

    if (params.status) {
      query = query.eq("status", params.status.trim());
    }

    if (params.startDate) {
      query = query.gte("created_at", `${params.startDate}T00:00:00.000Z`);
    }

    if (params.endDate) {
      query = query.lte("created_at", `${params.endDate}T23:59:59.999Z`);
    }

    const { data: proposals, error } = await query;
    if (error) {
      throw new Error(`Proposal list failed: ${error.message}`);
    }

    const projectIds = [...new Set((proposals ?? []).map((proposal) => proposal.project_id))];
    const { data: projects, error: projectsError } = projectIds.length
      ? await context.supabase
          .from("projects")
          .select("id, name, status")
          .in("id", projectIds)
      : { data: [], error: null };

    if (projectsError) {
      throw new Error(`Project lookup failed: ${projectsError.message}`);
    }

    const projectMap = new Map((projects ?? []).map((project) => [project.id, project]));

    return {
      success: true,
      results: (proposals ?? []).map((proposal) => ({
        id: proposal.id,
        projectId: proposal.project_id,
        projectName: projectMap.get(proposal.project_id)?.name ?? null,
        projectStatus: projectMap.get(proposal.project_id)?.status ?? null,
        revisionNo: proposal.revision_no,
        revisionCode: proposal.revision_code,
        status: proposal.status,
        totalCost: proposal.total_cost === null ? null : Number(proposal.total_cost),
        totalPrice: proposal.total_price === null ? null : Number(proposal.total_price),
        totalVat: proposal.total_vat === null ? null : Number(proposal.total_vat),
        submittedAt: proposal.submitted_at,
        createdAt: proposal.created_at,
        updatedAt: proposal.updated_at,
      })),
    };
  },
});
