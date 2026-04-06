import { z } from "zod";
import { calculateProposal as calculateProposalService } from "@/lib/proposals/proposal-service";
import { defineTool, type ToolDefinition } from "./tool-definition";

const parameters = z.object({
  proposalId: z.string().uuid().describe("Hesaplanacak teklif ID"),
});

export const calculateProposal: ToolDefinition<
  typeof parameters,
  {
    success: boolean;
    proposalId: string;
    totalCost: number;
    totalPrice: number;
    totalVat: number;
    grandTotal: number;
  }
> = defineTool({
  name: "calculateProposal",
  description:
    "Teklif BOQ snapshot'i uzerinden maliyet, marj, indirim ve KDV toplamlarini hesaplar.",
  needsApproval: false,
  parameters,
  execute: async (params, context) => {
    const summary = await calculateProposalService(context.supabase, params.proposalId);

    return {
      success: true,
      proposalId: summary.proposal.id,
      totalCost: summary.totals.totalCost,
      totalPrice: summary.totals.totalPrice,
      totalVat: summary.totals.totalVat,
      grandTotal: summary.totals.grandTotal,
    };
  },
});
