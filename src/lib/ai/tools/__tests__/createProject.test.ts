import { beforeEach, describe, expect, it, vi } from "vitest";
import { createProject } from "../createProject";
import { createDriveFolder } from "../createDriveFolder";
import type { ToolContext } from "../index";

vi.mock("../createDriveFolder", () => ({
  createDriveFolder: {
    execute: vi.fn(),
  },
}));

function createMockContext(options?: {
  existingCustomer?: { id: string; name: string } | null;
  role?: string | null;
}) {
  const insertedCustomer = { id: "customer-2", name: "XYZ Holding" };
  const insertedProject = {
    id: "project-1",
    project_code: "AKR-2026-0013",
    name: "Konut A Blok",
    description: null,
    budget: null,
    status: "teklif_asamasi",
    created_at: "2026-04-05T10:00:00.000Z",
  };

  const context = {
    tenantId: "tenant-1",
    userId: "user-1",
    role: options?.role ?? "admin",
    supabase: {
      from(table: string) {
        if (table === "tenant_memberships") {
          return {
            select() {
              return {
                eq(_column: string, _value: string) {
                  return {
                    eq(_nestedColumn: string, _nestedValue: string) {
                      return {
                        maybeSingle() {
                          return Promise.resolve({
                            data: { role: options?.role ?? "admin" },
                            error: null,
                          });
                        },
                      };
                    },
                  };
                },
              };
            },
          };
        }

        if (table === "customers") {
          return {
            select() {
              return {
                ilike() {
                  return {
                    limit() {
                      return Promise.resolve({
                        data: options?.existingCustomer
                          ? [options.existingCustomer]
                          : [],
                        error: null,
                      });
                    },
                  };
                },
              };
            },
            insert(payload: { name: string }) {
              return {
                select() {
                  return {
                    single() {
                      return Promise.resolve({
                        data: {
                          ...insertedCustomer,
                          name: payload.name,
                        },
                        error: null,
                      });
                    },
                  };
                },
              };
            },
          };
        }

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
            select(_value: string, queryOptions?: { count?: string; head?: boolean }) {
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
            insert(payload: {
              project_code: string;
              name: string;
              description: string | null;
              budget: number | null;
              status: string;
            }) {
              return {
                select() {
                  return {
                    single() {
                      return Promise.resolve({
                        data: {
                          ...insertedProject,
                          project_code: payload.project_code,
                          name: payload.name,
                          description: payload.description,
                          budget: payload.budget,
                          status: payload.status,
                        },
                        error: null,
                      });
                    },
                  };
                },
              };
            },
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      },
    },
  };

  return context as unknown as ToolContext;
}

describe("createProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createDriveFolder.execute).mockResolvedValue({
      success: true,
      rootFolder: {
        id: "drive-root-1",
        name: "AKR-2026-0013_Konut A Blok",
        webViewLink: "https://drive.google.com/root",
      },
      createdFolderCount: 25,
    });
  });

  it("should have correct tool metadata", () => {
    expect(createProject.name).toBe("createProject");
    expect(createProject.description).toBeTruthy();
  });

  it("should create a project with required fields", async () => {
    const context = createMockContext({
      existingCustomer: { id: "customer-1", name: "ABC Insaat" },
    });

    const result = await createProject.execute(
      {
        name: "Konut A Blok",
        customer: "ABC Insaat",
      },
      context,
    );

    expect(result.success).toBe(true);
    expect(result.project.name).toBe("Konut A Blok");
    expect(result.project.customer).toBe("ABC Insaat");
    expect(result.project.code).toBe("AKR-2026-0013");
    expect(result.project.id).toBe("project-1");
    expect(result.project.createdAt).toBe("2026-04-05T10:00:00.000Z");
    expect(result.project.budget).toBeNull();
    expect(result.project.description).toBeNull();
    expect(result.project.status).toBe("teklif_asamasi");
    expect(result.driveFolder.id).toBe("drive-root-1");
  });

  it("should create a project with optional fields", async () => {
    const context = createMockContext();

    const result = await createProject.execute(
      {
        name: " AVM Projesi ",
        customer: "XYZ Holding",
        budget: 5000000,
        description: "Yeni AVM insaati",
      },
      context,
    );

    expect(result.success).toBe(true);
    expect(result.project.name).toBe("AVM Projesi");
    expect(result.project.customer).toBe("XYZ Holding");
    expect(result.project.budget).toBe(5000000);
    expect(result.project.description).toBe("Yeni AVM insaati");
  });

  it("should reject unauthorized users", async () => {
    const context = createMockContext({
      role: "user",
    });

    await expect(
      createProject.execute(
        {
          name: "Yetkisiz Proje",
          customer: "ABC Insaat",
        },
        context,
      ),
    ).rejects.toThrow("Proje olusturma yetkiniz yok.");
  });

  it("should validate parameters with zod schema", () => {
    const valid = createProject.parameters.safeParse({
      name: "Test",
      customer: "Test Customer",
    });
    expect(valid.success).toBe(true);

    const invalid = createProject.parameters.safeParse({
      name: "",
      customer: "Test",
    });
    expect(invalid.success).toBe(false);
  });

  it("should reject missing required fields", () => {
    const result = createProject.parameters.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject negative budget", () => {
    const result = createProject.parameters.safeParse({
      name: "Test",
      customer: "Test",
      budget: -100,
    });
    expect(result.success).toBe(false);
  });
});
