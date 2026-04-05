import { describe, it, expect } from "vitest";
import {
  defineTool,
  createProject,
  getDashboard,
  getTools,
} from "../index";
import { z } from "zod";

describe("defineTool", () => {
  it("should return the tool definition unchanged", () => {
    const tool = defineTool({
      name: "testTool",
      description: "A test tool",
      parameters: z.object({ input: z.string() }),
      execute: async (params, _context) => ({ echo: params.input }),
    });

    expect(tool.name).toBe("testTool");
    expect(tool.description).toBe("A test tool");
  });
});

describe("tool registry exports", () => {
  it("should export createProject", () => {
    expect(createProject).toBeDefined();
    expect(createProject.name).toBe("createProject");
  });

  it("should export getDashboard", () => {
    expect(getDashboard).toBeDefined();
    expect(getDashboard.name).toBe("getDashboard");
  });

  it("should build AI SDK tools from the shared registry", () => {
    const tools = getTools({
      supabase: {} as never,
      tenantId: "tenant-1",
      userId: "user-1",
    });

    expect(tools.createProject).toBeDefined();
    expect(tools.getDashboard).toBeDefined();
  });
});
