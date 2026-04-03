import { z } from "zod";
import { defineTool } from "./index";

const parameters = z.object({
  name: z.string().min(1).describe("Proje adi"),
  customer: z.string().min(1).describe("Musteri adi"),
  budget: z.number().positive().optional().describe("Butce (TL)"),
  description: z.string().optional().describe("Proje aciklamasi"),
});

export type CreateProjectParams = z.infer<typeof parameters>;

export interface CreateProjectResult {
  success: boolean;
  project: {
    id: string;
    name: string;
    customer: string;
    budget: number | null;
    description: string | null;
    createdAt: string;
  };
}

export const createProject = defineTool({
  name: "createProject",
  description:
    "Yeni bir proje olusturur. Proje adi ve musteri zorunludur, butce ve aciklama opsiyoneldir.",
  parameters,
  execute: async (params): Promise<CreateProjectResult> => {
    const project = {
      id: crypto.randomUUID(),
      name: params.name,
      customer: params.customer,
      budget: params.budget ?? null,
      description: params.description ?? null,
      createdAt: new Date().toISOString(),
    };

    // TODO: Supabase entegrasyonu — proje veritabanina kaydedilecek
    return { success: true, project };
  },
});
