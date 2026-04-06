import { z } from "zod";
import { assertTenantPermission, canImportBOQ } from "@/lib/auth/permissions";
import { importBOQFromExcel } from "@/lib/boq/import-service";
import { defineTool } from "./tool-definition";

const parameters = z.object({
  projectId: z.string().uuid().describe("BOQ'nun ait oldugu proje ID"),
  fileName: z.string().min(1).describe("Excel dosya adi"),
  mimeType: z.string().min(1).describe("Dosya MIME type"),
  contentBase64: z.string().min(1).describe("Dosya icerigi base64"),
});

export const importBOQ = defineTool({
  name: "importBOQ",
  description: "Excel BOQ dosyasini staging ve dogrulama adimlariyla ice aktarir.",
  needsApproval: true,
  parameters,
  execute: async (params, context) => {
    await assertTenantPermission(
      context.supabase,
      context.tenantId,
      context.userId,
      canImportBOQ,
      "BOQ ice aktarma yetkiniz yok.",
    );

    const file = new File([Buffer.from(params.contentBase64, "base64")], params.fileName, {
      type: params.mimeType,
    });

    return importBOQFromExcel(
      context.supabase,
      file,
      params.projectId,
      context.tenantId
    );
  },
});
