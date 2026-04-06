import { z } from "zod";
import { assertPermission, canViewAllProjects } from "@/lib/auth/permissions";
import { defineTool, type ToolContext } from "./tool-definition";

const parameters = z.object({
  query: z.string().optional().describe("Proje adi, kodu veya musteri adi"),
  status: z.string().optional().describe("Proje durumu filtresi"),
  dateFrom: z.string().optional().describe("Baslangic tarihi (YYYY-MM-DD)"),
  dateTo: z.string().optional().describe("Bitis tarihi (YYYY-MM-DD)"),
});

interface DriveRootFolder {
  project_id?: string | null;
  discipline?: string | null;
}

export const searchProjects = defineTool({
  name: "searchProjects",
  description:
    "Projeleri ada, musteriye, duruma veya tarih araligina gore arar.",
  parameters,
  execute: async (params, context: ToolContext) => {
    assertPermission(
      canViewAllProjects(context.role),
      "Projeleri arama yetkiniz yok.",
    );

    let query = context.supabase
      .from("projects")
      .select(
        "id, project_code, name, description, status, budget, currency, created_at, updated_at",
      )
      .order("updated_at", { ascending: false })
      .limit(100);

    if (params.status) {
      query = query.eq("status", params.status.trim());
    }

    if (params.dateFrom) {
      query = query.gte("created_at", `${params.dateFrom}T00:00:00.000Z`);
    }

    if (params.dateTo) {
      query = query.lte("created_at", `${params.dateTo}T23:59:59.999Z`);
    }

    const [{ data: projects, error: projectError }, { data: driveRoots, error: driveError }] =
      await Promise.all([
        query,
        (context.supabase as any)
          .from("drive_files")
          .select("project_id, discipline")
          .eq("file_role", "folder")
          .is("drive_parent_id", null),
      ]);

    const firstError = projectError ?? driveError;
    if (firstError) {
      throw new Error(`Project search failed: ${firstError.message}`);
    }

    const rootByProjectId = new Map<string, DriveRootFolder>();
    for (const row of ((driveRoots ?? []) as DriveRootFolder[])) {
      if (row.project_id) {
        rootByProjectId.set(row.project_id, row);
      }
    }

    const normalizedQuery = params.query?.trim().toLocaleLowerCase("tr") ?? "";

    const results = (projects ?? [])
      .map((project) => {
        const driveRoot = rootByProjectId.get(project.id);
        const customerName = driveRoot?.discipline ?? null;

        return {
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          budget: project.budget === null ? null : Number(project.budget),
          currency: project.currency,
          customer: customerName,
          code: project.project_code,
          createdAt: project.created_at,
          updatedAt: project.updated_at,
        };
      })
      .filter((project) => {
        if (!normalizedQuery) {
          return true;
        }

        const haystack = [
          project.name,
          project.customer,
          project.code,
          project.status,
          project.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("tr");

        return haystack.includes(normalizedQuery);
      });

    return {
      success: true,
      results,
    };
  },
});
