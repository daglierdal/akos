import { z } from "zod";
import { defineTool } from "./index";

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

export const getDashboard = defineTool({
  name: "getDashboard",
  description:
    "Dashboard ozet verilerini getirir: aktif projeler, musteri sayisi, bekleyen teklifler ve son aktiviteler.",
  parameters,
  execute: async (params): Promise<GetDashboardResult> => {
    const summary: DashboardSummary = {
      activeProjects: 0,
      totalCustomers: 0,
      pendingProposals: 0,
      recentActivities: [],
      period: params.period,
    };

    // TODO: Supabase entegrasyonu — gercek veriler cekilecek
    return { success: true, summary };
  },
});
