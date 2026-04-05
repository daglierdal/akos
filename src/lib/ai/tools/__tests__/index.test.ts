import { describe, it, expect } from "vitest";
import {
  defineTool,
  createProject,
  createDriveFolder,
  getDashboard,
  searchDocuments,
  uploadDocument,
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

  it("should export createDriveFolder", () => {
    expect(createDriveFolder).toBeDefined();
    expect(createDriveFolder.name).toBe("createDriveFolder");
  });

  it("should export searchDocuments", () => {
    expect(searchDocuments).toBeDefined();
    expect(searchDocuments.name).toBe("searchDocuments");
  });

  it("should export uploadDocument", () => {
    expect(uploadDocument).toBeDefined();
    expect(uploadDocument.name).toBe("uploadDocument");
  });

  it("should build AI SDK tools from the shared registry", () => {
    const tools = getTools({
      supabase: {} as never,
      tenantId: "tenant-1",
      userId: "user-1",
    });

    expect(tools.createProject).toBeDefined();
    expect(tools.createDriveFolder).toBeDefined();
    expect(tools.getDashboard).toBeDefined();
    expect(tools.searchDocuments).toBeDefined();
    expect(tools.searchDocuments).toBeDefined();
    expect(tools.uploadDocument).toBeDefined();
  });
});
