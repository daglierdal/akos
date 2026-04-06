import { z } from "zod";
import {
  assertTenantPermission,
  canCreateProposal,
} from "@/lib/auth/permissions";
import {
  createProposal as createProposalService,
  reviseProposal as reviseProposalService,
} from "@/lib/proposals/proposal-service";
import { defineTool, type ToolDefinition } from "./tool-definition";

const parameters = z
  .object({
    projectId: z.string().uuid().optional().describe("Yeni teklif acilacak proje ID"),
    proposalId: z
      .string()
      .uuid()
      .optional()
      .describe("Revizyon acilacak mevcut teklif ID"),
  })
  .refine((value) => value.projectId || value.proposalId, {
    message: "projectId veya proposalId zorunludur.",
  });

export const createProposal: ToolDefinition<
  typeof parameters,
  {
    success: boolean;
    proposalId: string;
    revisionCode: string;
    mode: "create" | "revise";
  }
> = defineTool({
  name: "createProposal",
  description:
    "Yeni teklif veya mevcut teklif icin yeni revizyon acarak BOQ snapshot ve Drive klasor yapisini olusturur.",
  needsApproval: true,
  parameters,
  execute: async (params, context) => {
    await assertTenantPermission(
      context.supabase,
      context.tenantId,
      context.userId,
      canCreateProposal,
      "Teklif olusturma yetkiniz yok.",
    );

    if (params.proposalId) {
      const proposal = await reviseProposalService(context.supabase, params.proposalId);

      return {
        success: true,
        proposalId: proposal.id,
        revisionCode: proposal.revision_code,
        mode: "revise" as const,
      };
    }

    const proposal = await createProposalService(
      context.supabase,
      params.projectId!,
      context.tenantId
    );

    return {
      success: true,
      proposalId: proposal.id,
      revisionCode: proposal.revision_code,
      mode: "create" as const,
    };
  },
});
