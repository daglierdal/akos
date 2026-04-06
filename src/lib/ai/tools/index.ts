import { tool } from "ai";
import type { ToolSet } from "ai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createProject } from "./createProject";
import { createDriveFolder } from "./createDriveFolder";
import { generateBOQFromDocs } from "./generateBOQFromDocs";
import { getDashboard } from "./getDashboard";
import { importBOQ } from "./importBOQ";
import { importPriceList } from "./importPriceList";
import { searchDocuments } from "./searchDocuments";
import { searchPrices } from "./searchPrices";
import { suggestPrices } from "./suggestPrices";
import {
  defineTool,
  type ToolContext,
  type ToolDefinition,
} from "./tool-definition";
import { uploadDocument } from "./uploadDocument";

export interface ToolsContext extends ToolContext {}
const registry = [
  createProject,
  createDriveFolder,
  getDashboard,
  importBOQ,
  generateBOQFromDocs,
  suggestPrices,
  searchPrices,
  importPriceList,
  searchDocuments,
  uploadDocument,
] as const;

export function getTools(context: ToolsContext): ToolSet {
  return Object.fromEntries(
    registry.map((toolDefinition) => [
      toolDefinition.name,
      tool({
        description: toolDefinition.description,
        inputSchema: toolDefinition.parameters as never,
        execute: async (params: never) =>
          toolDefinition.execute(params, context),
      }),
    ])
  ) as ToolSet;
}

export {
  createProject,
  createDriveFolder,
  generateBOQFromDocs,
  getDashboard,
  importBOQ,
  importPriceList,
  searchDocuments,
  searchPrices,
  suggestPrices,
  uploadDocument,
};
export { defineTool };
export type { ToolContext, ToolDefinition };
