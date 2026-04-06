import { z } from "zod";
import { getDriveClient } from "@/lib/drive/client";
import {
  generateProposalPDF,
  uploadProposalPDF,
} from "@/lib/proposals/pdf-service";
import { submitProposal as submitProposalService } from "@/lib/proposals/proposal-service";
import { defineTool, type ToolDefinition } from "./tool-definition";

const parameters = z.object({
  proposalId: z.string().uuid().describe("Sunulacak teklif ID"),
});

export const submitProposal: ToolDefinition<
  typeof parameters,
  {
    success: boolean;
    proposalId: string;
    status: string;
    documentId: string;
    driveFileId: string;
  }
> = defineTool({
  name: "submitProposal",
  description:
    "Teklif PDF'ini olusturur, Drive'a kaydeder ve teklifi submitted durumuna gecirir.",
  needsApproval: true,
  parameters,
  execute: async (params, context) => {
    const driveClient = await getDriveClient(context.supabase, context.tenantId);
    const pdfBuffer = await generateProposalPDF(context.supabase, params.proposalId);
    const uploaded = await uploadProposalPDF(
      context.supabase,
      driveClient,
      params.proposalId,
      pdfBuffer
    );
    const proposal = await submitProposalService(context.supabase, params.proposalId);

    return {
      success: true,
      proposalId: proposal.id,
      status: proposal.status,
      documentId: uploaded.documentId,
      driveFileId: uploaded.driveFileId,
    };
  },
});
