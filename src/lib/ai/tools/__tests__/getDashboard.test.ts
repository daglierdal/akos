import { describe, it, expect } from "vitest";
import { getDashboard } from "../getDashboard";
import type { ToolContext } from "../index";

function createMockContext() {
  const counts = {
    projects: 7,
    customers: 12,
    proposals: 4,
  };

  const context = {
    tenantId: "tenant-1",
    userId: "user-1",
    supabase: {
      from(table: string) {
        return {
          select() {
            if (table === "customers") {
              return { count: counts.customers, error: null };
            }

            return {
              eq() {
                if (table === "projects") {
                  return { count: counts.projects, error: null };
                }

                if (table === "proposals") {
                  return { count: counts.proposals, error: null };
                }

                throw new Error(`Unexpected table: ${table}`);
              },
            };
          },
        };
      },
    },
  };

  return context as unknown as ToolContext;
}

describe("getDashboard", () => {
  it("should have correct tool metadata", () => {
    expect(getDashboard.name).toBe("getDashboard");
    expect(getDashboard.description).toBeTruthy();
  });

  it("should return dashboard summary with default period", async () => {
    const result = await getDashboard.execute(
      { period: "month" },
      createMockContext()
    );

    expect(result.success).toBe(true);
    expect(result.summary.period).toBe("month");
    expect(result.summary.activeProjects).toBe(7);
    expect(result.summary.totalCustomers).toBe(12);
    expect(result.summary.pendingProposals).toBe(4);
    expect(result.summary.recentActivities).toEqual([]);
  });

  it("should accept different periods", async () => {
    for (const period of ["week", "month", "quarter", "year"] as const) {
      const result = await getDashboard.execute(
        { period },
        createMockContext()
      );
      expect(result.success).toBe(true);
      expect(result.summary.period).toBe(period);
    }
  });

  it("should validate period parameter", () => {
    const valid = getDashboard.parameters.safeParse({ period: "week" });
    expect(valid.success).toBe(true);

    const invalid = getDashboard.parameters.safeParse({ period: "day" });
    expect(invalid.success).toBe(false);
  });

  it("should use default period when not specified", () => {
    const result = getDashboard.parameters.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.period).toBe("month");
    }
  });
});
