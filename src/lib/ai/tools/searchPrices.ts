import { z } from "zod";
import { searchPrices as searchPricesService } from "@/lib/boq/price-service";
import { defineTool } from "./tool-definition";

const parameters = z.object({
  itemName: z.string().optional().describe("Kalem adi filtresi"),
  discipline: z.string().optional().describe("Disiplin filtresi"),
  city: z.string().optional().describe("Sehir filtresi"),
});

export const searchPrices = defineTool({
  name: "searchPrices",
  description: "Fiyat veritabaninda kalem, disiplin ve sehire gore arama yapar.",
  needsApproval: false,
  parameters,
  execute: async (params, context) => {
    const result = await searchPricesService(context.supabase, params);

    return {
      success: true,
      ...result,
    };
  },
});
