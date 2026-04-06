import { z } from "zod";
import { assertPermission, canViewAllProjects } from "@/lib/auth/permissions";
import { defineTool, type ToolContext } from "./tool-definition";

const parameters = z.object({
  projectId: z.string().uuid().optional().describe("Opsiyonel proje ID"),
  type: z.string().optional().describe("Dokuman turu"),
  discipline: z.string().optional().describe("Disiplin filtresi"),
});

function matchesDiscipline(
  metadata: Record<string, unknown> | null | undefined,
  discipline: string | undefined,
) {
  if (!discipline) {
    return true;
  }

  const expected = discipline.trim().toLocaleLowerCase("tr");
  const candidate = String(metadata?.discipline ?? metadata?.routeHint ?? "")
    .toLocaleLowerCase("tr")
    .trim();

  return candidate.includes(expected);
}

export const listDocuments = defineTool({
  name: "listDocuments",
  description:
    "Dokumanlari proje, tur ve disipline gore listeler.",
  parameters,
  execute: async (params, context: ToolContext) => {
    assertPermission(
      canViewAllProjects(context.role),
      "Dokumanlari listeleme yetkiniz yok.",
    );

    let query = context.supabase
      .from("documents")
      .select(
        "id, project_id, proposal_id, title, category, original_filename, standard_filename, mime_type, metadata, created_at, updated_at",
      )
      .order("updated_at", { ascending: false })
      .limit(100);

    if (params.projectId) {
      query = query.eq("project_id", params.projectId);
    }

    if (params.type) {
      query = query.eq("category", params.type.trim());
    }

    const { data: documents, error } = await query;
    if (error) {
      throw new Error(`Document list failed: ${error.message}`);
    }

    const filtered = (documents ?? []).filter((document) =>
      matchesDiscipline(
        (document.metadata ?? null) as Record<string, unknown> | null,
        params.discipline,
      ),
    );

    return {
      success: true,
      results: filtered.map((document) => ({
        id: document.id,
        projectId: document.project_id,
        proposalId: document.proposal_id,
        title: document.title,
        category: document.category,
        originalFilename: document.original_filename,
        standardFilename: document.standard_filename,
        mimeType: document.mime_type,
        discipline:
          ((document.metadata as Record<string, unknown> | null)?.discipline as string | undefined)
            ?? null,
        createdAt: document.created_at,
        updatedAt: document.updated_at,
      })),
    };
  },
});
