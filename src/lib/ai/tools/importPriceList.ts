import { z } from "zod";
import { importPriceList as importPriceListService } from "@/lib/boq/price-service";
import { defineTool } from "./tool-definition";

const parameters = z.object({
  fileName: z.string().min(1).describe("Fiyat listesi dosya adi"),
  mimeType: z.string().min(1).describe("Dosya MIME type"),
  contentBase64: z.string().min(1).describe("Dosya icerigi base64"),
});

export const importPriceList = defineTool({
  name: "importPriceList",
  description: "Excel veya PDF fiyat listesini fiyat veritabanina aktarir.",
  needsApproval: true,
  parameters,
  execute: async (params, context) => {
    const file = new File([Buffer.from(params.contentBase64, "base64")], params.fileName, {
      type: params.mimeType,
    });

    return importPriceListService(context.supabase, file, context.tenantId);
  },
});
