import { describe, it, expect } from "vitest";
import { createProject } from "../createProject";
import type { ToolContext } from "../index";

function createMockContext(options?: {
  existingCustomer?: { id: string; name: string } | null;
}) {
  const insertedCustomer = { id: "customer-2", name: "XYZ Holding" };
  const insertedProject = {
    id: "project-1",
    name: "Konut A Blok",
    description: null,
    budget: null,
    created_at: "2026-04-05T10:00:00.000Z",
  };

  const context = {
    tenantId: "tenant-1",
    userId: "user-1",
    supabase: {
      from(table: string) {
        if (table === "customers") {
          return {
            select() {
              return {
                ilike() {
                  return {
                    limit() {
                      return {
                        data: options?.existingCustomer
                          ? [options.existingCustomer]
                          : [],
                        error: null,
                      };
                    },
                  };
                },
                limit() {
                  return { data: [], error: null };
                },
              };
            },
            insert(payload: { name: string }) {
              return {
                select() {
                  return {
                    single() {
                      return {
                        data: {
                          ...insertedCustomer,
                          name: payload.name,
                        },
                        error: null,
                      };
                    },
                  };
                },
              };
            },
          };
        }

        if (table === "projects") {
          return {
            insert(payload: {
              name: string;
              description: string | null;
              budget: number | null;
            }) {
              return {
                select() {
                  return {
                    single() {
                      return {
                        data: {
                          ...insertedProject,
                          name: payload.name,
                          description: payload.description,
                          budget: payload.budget,
                        },
                        error: null,
                      };
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
  it("should have correct tool metadata", () => {
    expect(createProject.name).toBe("createProject");
    expect(createProject.description).toBeTruthy();
  });

  it("should create a project with required fields", async () => {
    const context = createMockContext({
      existingCustomer: { id: "customer-1", name: "ABC Insaat" },
    });

    const result = await createProject.execute({
      name: "Konut A Blok",
      customer: "ABC Insaat",
    }, context);

    expect(result.success).toBe(true);
    expect(result.project.name).toBe("Konut A Blok");
    expect(result.project.customer).toBe("ABC Insaat");
    expect(result.project.id).toBe("project-1");
    expect(result.project.createdAt).toBe("2026-04-05T10:00:00.000Z");
    expect(result.project.budget).toBeNull();
    expect(result.project.description).toBeNull();
  });

  it("should create a project with optional fields", async () => {
    const context = createMockContext();

    const result = await createProject.execute({
      name: " AVM Projesi ",
      customer: "XYZ Holding",
      budget: 5000000,
      description: "Yeni AVM insaati",
    }, context);

    expect(result.success).toBe(true);
    expect(result.project.name).toBe("AVM Projesi");
    expect(result.project.customer).toBe("XYZ Holding");
    expect(result.project.budget).toBe(5000000);
    expect(result.project.description).toBe("Yeni AVM insaati");
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
