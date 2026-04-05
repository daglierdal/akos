import { z } from "zod";
import type { ToolContext, ToolDefinition } from "./index";

const parameters = z.object({
  period: z
    .enum(["week", "month", "quarter", "year"])
    .default("month")
    .describe("Ozet donemi"),
});

export type GetDashboardParams = z.infer<typeof parameters>;

export interface DashboardSummary {
  activeProjects: number;
  totalCustomers: number;
  pendingProposals: number;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
  }>;
  period: string;
}

export interface GetDashboardResult {
  success: boolean;
  summary: DashboardSummary;
}

export const getDashboard: ToolDefinition<
  typeof parameters,
  GetDashboardResult
> = {
  name: "getDashboard",
  description:
    "Dashboard ozet verilerini getirir: aktif projeler, musteri sayisi, bekleyen teklifler ve son aktiviteler.",
  parameters,
  execute: async (
    params,
    context: ToolContext
  ): Promise<GetDashboardResult> => {
    void context.tenantId;
    void context.userId;

    const [
      { count: activeProjects, error: projectsError },
      { count: totalCustomers, error: customersError },
      { count: pendingProposals, error: proposalsError },
    ] = await Promise.all([
      context.supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),
      context.supabase
        .from("customers")
        .select("*", { count: "exact", head: true }),
      context.supabase
        .from("proposals")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft"),
    ]);

    const firstError = projectsError ?? customersError ?? proposalsError;
    if (firstError) {
      throw new Error(`Dashboard query failed: ${firstError.message}`);
    }

    return {
      success: true,
      summary: {
        activeProjects: activeProjects ?? 0,
        totalCustomers: totalCustomers ?? 0,
        pendingProposals: pendingProposals ?? 0,
        recentActivities: [],
        period: params.period,
      },
    };
  },
};
