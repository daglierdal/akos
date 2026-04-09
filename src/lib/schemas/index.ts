import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1).describe("Proje adı"),
  customer_id: z.string().uuid().optional().describe("Müşteri ID"),
  budget: z.number().positive().optional().describe("Bütçe"),
  currency: z.string().default("TRY").describe("Para birimi"),
});

export const uploadDocumentSchema = z.object({
  project_id: z.string().uuid().describe("Proje ID"),
  department: z.enum(["planlama", "insaat", "mekanik", "elektrik"]).describe("Departman"),
  file_name: z.string().min(1).describe("Dosya adı"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
