import { z } from "zod";
import type { ToolContext, ToolDefinition } from "./index";

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

export const createProject: ToolDefinition<
  typeof parameters,
  CreateProjectResult
> = {
  name: "createProject",
  description:
    "Yeni bir proje olusturur. Proje adi ve musteri zorunludur, butce ve aciklama opsiyoneldir.",
  parameters,
  execute: async (
    params,
    context: ToolContext
  ): Promise<CreateProjectResult> => {
    const projectName = params.name.trim();
    const customerName = params.customer.trim();

    const { data: existingCustomers, error: customerLookupError } =
      await context.supabase
        .from("customers")
        .select("id, name")
        .ilike("name", customerName)
        .limit(1);

    if (customerLookupError) {
      throw new Error(
        `Customer lookup failed: ${customerLookupError.message}`
      );
    }

    let customer = existingCustomers?.[0] ?? null;

    if (!customer) {
      const { data: insertedCustomer, error: customerInsertError } =
        await context.supabase
          .from("customers")
          .insert({
            tenant_id: context.tenantId,
            name: customerName,
          })
          .select("id, name")
          .single();

      if (customerInsertError) {
        throw new Error(
          `Customer creation failed: ${customerInsertError.message}`
        );
      }

      customer = insertedCustomer;
    }

    if (!customer) {
      throw new Error("Customer could not be created");
    }

    const { data: project, error: projectInsertError } = await context.supabase
      .from("projects")
      .insert({
        tenant_id: context.tenantId,
        name: projectName,
        description: params.description?.trim() || null,
        budget: params.budget ?? null,
      })
      .select("id, name, description, budget, created_at")
      .single();

    if (projectInsertError) {
      throw new Error(`Project creation failed: ${projectInsertError.message}`);
    }

    return {
      success: true,
      project: {
        id: project.id,
        name: project.name,
        customer: customer.name,
        budget:
          project.budget === null ? null : Number(project.budget),
        description: project.description,
        createdAt: project.created_at,
      },
    };
  },
};
