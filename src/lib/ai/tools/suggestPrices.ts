import { z } from "zod";
import { suggestPrices as suggestPricesService } from "@/lib/boq/price-service";
import { defineTool } from "./tool-definition";

const parameters = z.object({
  projectId: z.string().uuid().describe("Fiyat onerisi alinacak proje ID"),
});

export const suggestPrices = defineTool({
  name: "suggestPrices",
  description:
    "Projedeki BOQ kalemlerini fiyat veritabani ile eslestirir ve malzeme/iscilik onerileri dondurur.",
  needsApproval: false,
  parameters,
  execute: async (params, context) => {
    const suggestions = await suggestPricesService(context.supabase, params.projectId);

    return {
      success: true,
      count: suggestions.length,
      suggestions,
    };
  },
});
