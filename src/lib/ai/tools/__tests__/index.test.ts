import { describe, it, expect } from "vitest";
import {
  calculateProposal,
  createProposal,
  defineTool,
  createProject,
  createDriveFolder,
  generateBOQFromDocs,
  getDashboard,
  importBOQ,
  importPriceList,
  linkFileToProposal,
  searchDocuments,
  searchPrices,
  submitProposal,
  suggestPrices,
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

  it("should export createProposal", () => {
    expect(createProposal).toBeDefined();
    expect(createProposal.name).toBe("createProposal");
    expect(createProposal.needsApproval).toBe(true);
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

  it("should export importBOQ", () => {
    expect(importBOQ).toBeDefined();
    expect(importBOQ.name).toBe("importBOQ");
    expect(importBOQ.needsApproval).toBe(true);
  });

  it("should export generateBOQFromDocs", () => {
    expect(generateBOQFromDocs).toBeDefined();
    expect(generateBOQFromDocs.name).toBe("generateBOQFromDocs");
  });

  it("should export searchPrices", () => {
    expect(searchPrices).toBeDefined();
    expect(searchPrices.name).toBe("searchPrices");
  });

  it("should export suggestPrices", () => {
    expect(suggestPrices).toBeDefined();
    expect(suggestPrices.name).toBe("suggestPrices");
  });

  it("should export importPriceList", () => {
    expect(importPriceList).toBeDefined();
    expect(importPriceList.name).toBe("importPriceList");
    expect(importPriceList.needsApproval).toBe(true);
  });

  it("should export uploadDocument", () => {
    expect(uploadDocument).toBeDefined();
    expect(uploadDocument.name).toBe("uploadDocument");
  });

  it("should export calculateProposal", () => {
    expect(calculateProposal).toBeDefined();
    expect(calculateProposal.name).toBe("calculateProposal");
    expect(calculateProposal.needsApproval).toBe(false);
  });

  it("should export submitProposal", () => {
    expect(submitProposal).toBeDefined();
    expect(submitProposal.name).toBe("submitProposal");
    expect(submitProposal.needsApproval).toBe(true);
  });

  it("should export linkFileToProposal", () => {
    expect(linkFileToProposal).toBeDefined();
    expect(linkFileToProposal.name).toBe("linkFileToProposal");
  });

  it("should build AI SDK tools from the shared registry", () => {
    const tools = getTools({
      supabase: {} as never,
      tenantId: "tenant-1",
      userId: "user-1",
    });

    expect(tools.createProposal).toBeDefined();
    expect(tools.createProject).toBeDefined();
    expect(tools.createDriveFolder).toBeDefined();
    expect(tools.calculateProposal).toBeDefined();
    expect(tools.getDashboard).toBeDefined();
    expect(tools.importBOQ).toBeDefined();
    expect(tools.generateBOQFromDocs).toBeDefined();
    expect(tools.searchPrices).toBeDefined();
    expect(tools.suggestPrices).toBeDefined();
    expect(tools.importPriceList).toBeDefined();
    expect(tools.linkFileToProposal).toBeDefined();
    expect(tools.searchDocuments).toBeDefined();
    expect(tools.submitProposal).toBeDefined();
    expect(tools.uploadDocument).toBeDefined();
  });
});
