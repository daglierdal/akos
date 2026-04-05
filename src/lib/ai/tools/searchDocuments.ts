import { z } from "zod";
import { defineTool } from "./tool-definition";
import type { ToolContext } from "./tool-definition";

const parameters = z.object({
  query: z.string().min(1).describe("Aranacak dokuman sorgusu"),
  projectId: z.string().uuid().optional().describe("Opsiyonel proje ID"),
});

export type SearchDocumentsParams = z.infer<typeof parameters>;

export interface SearchDocumentsResult {
  success: boolean;
  results: Array<{
    id: string;
    title: string | null;
    projectId: string | null;
    originalFilename: string | null;
    mimeType: string | null;
    createdAt: string;
    rank: number;
    snippet: string;
  }>;
}

interface SearchDocumentsRow {
  id: string;
  title: string | null;
  project_id: string | null;
  original_filename: string | null;
  mime_type: string | null;
  created_at: string;
  rank: number;
  snippet: string | null;
}

export const searchDocuments = defineTool({
  name: "searchDocuments",
  description:
    "Yuklenen dokumanlarin parsed_text alaninda tam metin arama yapar ve ilgili parcayi getirir.",
  parameters,
  execute: async (
    params: SearchDocumentsParams,
    context: ToolContext
  ): Promise<SearchDocumentsResult> => {
    const query = params.query.trim();

    const { data, error } = await context.supabase.rpc(
      "search_documents_full_text",
      {
        p_project_id: params.projectId ?? null,
        p_query: query,
      }
    );

    if (error) {
      throw new Error(`Document search failed: ${error.message}`);
    }

    return {
      success: true,
      results: ((data ?? []) as SearchDocumentsRow[]).map((row) => ({
        id: row.id,
        title: row.title,
        projectId: row.project_id,
        originalFilename: row.original_filename,
        mimeType: row.mime_type,
        createdAt: row.created_at,
        rank: Number(row.rank ?? 0),
        snippet: row.snippet?.trim() || "",
      })),
    };
  },
});
