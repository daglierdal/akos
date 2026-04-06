import { describe, expect, it } from "vitest";
import {
  formatProjectSequence,
  formatProjectCode,
  generateProjectCode,
} from "@/lib/projects/project-code";

describe("project-code", () => {
  it("formats project codes with prefix, year and zero-padded sequence", () => {
    expect(
      formatProjectCode({
        prefix: "akr",
        year: 2026,
        sequence: 12,
      }),
    ).toBe("AKR-2026-0012");
  });

  it("falls back to a default prefix", () => {
    expect(
      formatProjectCode({
        prefix: "",
        year: 2026,
        sequence: 1,
      }),
    ).toBe("PRJ-2026-0001");
  });

  it("pads sequence values consistently", () => {
    expect(formatProjectSequence(7)).toBe("0007");
  });

  it("generates the next project code from tenant settings and yearly sequence", async () => {
    const supabase = {
      from(table: string) {
        if (table === "tenants") {
          return {
            select() {
              return {
                eq() {
                  return {
                    single() {
                      return Promise.resolve({
                        data: { project_code_prefix: "AKR" },
                        error: null,
                      });
                    },
                  };
                },
              };
            },
          };
        }

        if (table === "projects") {
          return {
            select(_columns: string, queryOptions?: { count?: string; head?: boolean }) {
              if (queryOptions?.head) {
                return {
                  eq() {
                    return {
                      gte() {
                        return {
                          lt() {
                            return Promise.resolve({
                              count: 12,
                              error: null,
                            });
                          },
                        };
                      },
                    };
                  },
                };
              }

              throw new Error("Unexpected projects select");
            },
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      },
    };

    await expect(
      generateProjectCode(supabase as never, "tenant-1", { year: 2026 }),
    ).resolves.toBe("AKR-2026-0013");
  });
});
