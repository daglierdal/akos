import { z } from "zod";
import { defineTool, type ToolDefinition } from "./tool-definition";

const parameters = z
  .object({
    proposalId: z.string().uuid().describe("Baglanti kurulacak teklif ID"),
    documentId: z.string().uuid().optional().describe("Documents tablosundaki dosya ID"),
    driveFileId: z
      .string()
      .min(1)
      .optional()
      .describe("Drive dosyasi veya klasoru external ID"),
  })
  .refine((value) => value.documentId || value.driveFileId, {
    message: "documentId veya driveFileId zorunludur.",
  });

export const linkFileToProposal: ToolDefinition<
  typeof parameters,
  {
    success: boolean;
    proposalId: string;
    linkedDocumentId: string | null;
    linkedDriveFileId: string | null;
  }
> = defineTool({
  name: "linkFileToProposal",
  description: "Belgeleri veya Drive dosyalarini bir teklif ile iliskilendirir.",
  needsApproval: false,
  parameters,
  execute: async (params, context) => {
    let linkedDocumentId: string | null = null;
    let linkedDriveFileId: string | null = null;

    if (params.documentId) {
      const { data, error } = await context.supabase
        .from("documents")
        .update({ proposal_id: params.proposalId })
        .eq("id", params.documentId)
        .eq("tenant_id", context.tenantId)
        .select("id")
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? "Document could not be linked to proposal.");
      }

      linkedDocumentId = data.id;
    }

    if (params.driveFileId) {
      const { data, error } = await context.supabase
        .from("drive_files")
        .update({ proposal_id: params.proposalId })
        .eq("drive_file_id", params.driveFileId)
        .eq("tenant_id", context.tenantId)
        .select("drive_file_id")
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? "Drive file could not be linked to proposal.");
      }

      linkedDriveFileId = data.drive_file_id;
    }

    return {
      success: true,
      proposalId: params.proposalId,
      linkedDocumentId,
      linkedDriveFileId,
    };
  },
});
