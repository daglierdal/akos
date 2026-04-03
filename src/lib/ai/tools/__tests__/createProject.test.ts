import { describe, it, expect } from "vitest";
import { createProject } from "../createProject";

describe("createProject", () => {
  it("should have correct tool metadata", () => {
    expect(createProject.name).toBe("createProject");
    expect(createProject.description).toBeTruthy();
  });

  it("should create a project with required fields", async () => {
    const result = await createProject.execute({
      name: "Konut A Blok",
      customer: "ABC Insaat",
    });

    expect(result.success).toBe(true);
    expect(result.project.name).toBe("Konut A Blok");
    expect(result.project.customer).toBe("ABC Insaat");
    expect(result.project.id).toBeTruthy();
    expect(result.project.createdAt).toBeTruthy();
    expect(result.project.budget).toBeNull();
    expect(result.project.description).toBeNull();
  });

  it("should create a project with optional fields", async () => {
    const result = await createProject.execute({
      name: "AVM Projesi",
      customer: "XYZ Holding",
      budget: 5000000,
      description: "Yeni AVM insaati",
    });

    expect(result.success).toBe(true);
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
