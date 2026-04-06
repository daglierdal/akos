import { z } from "zod";
import { canCreateProject, assertPermission } from "@/lib/auth/permissions";
import { generateProjectCode } from "@/lib/projects/project-code";
import { createDriveFolder } from "./createDriveFolder";
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
  customer: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    code: string;
    name: string;
    customer: string;
    budget: number | null;
    description: string | null;
    status: string;
    createdAt: string;
  };
  driveFolder: {
    id: string;
    name: string;
    webViewLink: string | null | undefined;
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
    assertPermission(
      canCreateProject(context.role),
      "Proje olusturma yetkiniz yok.",
    );

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

    const currentYear = new Date().getUTCFullYear();
    const startOfYear = `${currentYear}-01-01T00:00:00.000Z`;
    const startOfNextYear = `${currentYear + 1}-01-01T00:00:00.000Z`;

    const [
      { data: tenant, error: tenantError },
      { count: projectCount, error: projectCountError },
    ] = await Promise.all([
      context.supabase
        .from("tenants")
        .select("project_code_prefix")
        .eq("id", context.tenantId)
        .single(),
      context.supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfYear)
        .lt("created_at", startOfNextYear),
    ]);

    if (tenantError) {
      throw new Error(`Tenant lookup failed: ${tenantError.message}`);
    }

    if (projectCountError) {
      throw new Error(`Project code sequence failed: ${projectCountError.message}`);
    }

    const projectCode = generateProjectCode({
      prefix: tenant.project_code_prefix,
      year: currentYear,
      sequence: (projectCount ?? 0) + 1,
    });

    const { data: project, error: projectInsertError } = await context.supabase
      .from("projects")
      .insert({
        tenant_id: context.tenantId,
        name: projectName,
        customer_id: customer.id,
        description: params.description?.trim() || null,
        budget: params.budget ?? null,
        status: "teklif_asamasi",
      })
      .select("id, name, description, budget, status, created_at")
      .single();

    if (projectInsertError) {
      throw new Error(`Project creation failed: ${projectInsertError.message}`);
    }

    const driveFolder = await createDriveFolder.execute(
      {
        projectCode,
        projectId: project.id,
        projectName,
        customerName: customer.name,
      },
      context,
    );

    return {
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
      },
      project: {
        id: project.id,
        code: projectCode,
        name: project.name,
        customer: customer.name,
        budget:
          project.budget === null ? null : Number(project.budget),
        description: project.description,
        status: project.status,
        createdAt: project.created_at,
      },
      driveFolder: driveFolder.rootFolder,
    };
  },
};
