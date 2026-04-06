import { z } from "zod";
import {
  assertTenantPermission,
  canUploadDocument,
} from "@/lib/auth/permissions";
import { getDriveClient } from "@/lib/drive/client";
import { uploadDocument as uploadDocumentService } from "@/lib/documents/upload-service";
import { defineTool, type ToolDefinition } from "./tool-definition";

const parameters = z.object({
  projectId: z.string().uuid().describe("Proje ID"),
  fileName: z.string().min(1).describe("Dosya adi"),
  mimeType: z.string().min(1).describe("Dosya MIME type"),
  contentBase64: z.string().min(1).describe("Dosya icerigi base64"),
});

export interface UploadDocumentToolResult {
  success: boolean;
  documentId: string;
  versionId: string;
  category: string;
  storageType: "supabase" | "drive";
  standardFilename: string;
  routePath: string | null;
}

export const uploadDocument: ToolDefinition<
  typeof parameters,
  UploadDocumentToolResult
> = defineTool({
  name: "uploadDocument",
  description: "Dosya yukler, kategorize eder ve uygun depolama/klasore yerlestirir.",
  parameters,
  execute: async (params, context) => {
    await assertTenantPermission(
      context.supabase,
      context.tenantId,
      context.userId,
      canUploadDocument,
      "Dokuman yukleme yetkiniz yok.",
    );

    const driveClient = await getDriveClient(context.supabase, context.tenantId).catch(
      () => null
    );
    const file = new File([Buffer.from(params.contentBase64, "base64")], params.fileName, {
      type: params.mimeType,
    });
    const result = await uploadDocumentService(
      context.supabase,
      driveClient,
      file,
      params.projectId,
      context.tenantId,
      context.userId
    );

    return {
      success: result.success,
      documentId: result.documentId,
      versionId: result.versionId,
      category: result.category,
      storageType: result.storageType,
      standardFilename: result.standardFilename,
      routePath: result.routePath,
    };
  },
});
