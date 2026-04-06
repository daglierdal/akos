import { z } from "zod";
import { assertPermission, canViewAllProjects } from "@/lib/auth/permissions";
import { extractProjectCodeFromLabel } from "@/lib/drive/drive-files";
import { defineTool, type ToolContext } from "./tool-definition";

const parameters = z.object({
  projectId: z.string().uuid().describe("Durumu ozetlenecek proje ID"),
});

interface ProjectRootFolder {
  discipline?: string | null;
  revision_label?: string | null;
}

export const getProjectStatus = defineTool({
  name: "getProjectStatus",
  description:
    "Proje ozetini getirir: temel bilgiler, dokuman sayisi, aktif teklif durumu ve son aktiviteler.",
  parameters,
  execute: async (params, context: ToolContext) => {
    assertPermission(
      canViewAllProjects(context.role),
      "Projeleri goruntuleme yetkiniz yok.",
    );

    const [
      { data: project, error: projectError },
      { count: documentCount, error: documentCountError },
      { data: proposals, error: proposalError },
      { data: documents, error: documentsError },
    ] = await Promise.all([
      context.supabase
        .from("projects")
        .select("id, name, description, status, budget, currency, created_at, updated_at")
        .eq("id", params.projectId)
        .single(),
      context.supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("project_id", params.projectId),
      context.supabase
        .from("proposals")
        .select("id, revision_code, status, created_at, updated_at")
        .eq("project_id", params.projectId)
        .order("revision_no", { ascending: false })
        .limit(5),
      context.supabase
        .from("documents")
        .select("id, title, category, original_filename, created_at, updated_at")
        .eq("project_id", params.projectId)
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);

    const firstError =
      projectError ?? documentCountError ?? proposalError ?? documentsError;
    if (firstError) {
      throw new Error(`Project status query failed: ${firstError.message}`);
    }

    if (!project) {
      throw new Error("Project not found.");
    }

    const { data: rootFolder, error: rootFolderError } = await (context.supabase as any)
      .from("drive_files")
      .select("discipline, revision_label")
      .eq("project_id", project.id)
      .eq("file_role", "folder")
      .is("drive_parent_id", null)
      .maybeSingle();

    if (rootFolderError) {
      throw new Error(`Project code lookup failed: ${rootFolderError.message}`);
    }

    const activities = [
      ...(documents ?? []).map((document) => ({
        id: document.id,
        type: "document",
        title:
          document.title?.trim() || document.original_filename?.trim() || "Dokuman",
        date: document.updated_at ?? document.created_at,
      })),
      ...(proposals ?? []).map((proposal) => ({
        id: proposal.id,
        type: "proposal",
        title: `${proposal.revision_code} / ${proposal.status}`,
        date: proposal.updated_at ?? proposal.created_at,
      })),
    ]
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, 6);

    const activeProposal = proposals?.[0] ?? null;
    const typedRootFolder = (rootFolder ?? null) as ProjectRootFolder | null;

    return {
      success: true,
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        budget: project.budget === null ? null : Number(project.budget),
        currency: project.currency,
        code: extractProjectCodeFromLabel(typedRootFolder?.revision_label) ?? null,
        customer: typedRootFolder?.discipline ?? null,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      },
      documentCount: documentCount ?? 0,
      proposal: activeProposal
        ? {
            id: activeProposal.id,
            revisionCode: activeProposal.revision_code,
            status: activeProposal.status,
            updatedAt: activeProposal.updated_at,
          }
        : null,
      lastActivityAt: activities[0]?.date ?? project.updated_at,
      recentActivities: activities,
    };
  },
});
