import { describe, it, expect } from "vitest";
import { getDashboard } from "../getDashboard";

describe("getDashboard", () => {
  it("should have correct tool metadata", () => {
    expect(getDashboard.name).toBe("getDashboard");
    expect(getDashboard.description).toBeTruthy();
  });

  it("should return dashboard summary with default period", async () => {
    const result = await getDashboard.execute({ period: "month" });

    expect(result.success).toBe(true);
    expect(result.summary.period).toBe("month");
    expect(result.summary.activeProjects).toBe(0);
    expect(result.summary.totalCustomers).toBe(0);
    expect(result.summary.pendingProposals).toBe(0);
    expect(result.summary.recentActivities).toEqual([]);
  });

  it("should accept different periods", async () => {
    for (const period of ["week", "month", "quarter", "year"] as const) {
      const result = await getDashboard.execute({ period });
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
