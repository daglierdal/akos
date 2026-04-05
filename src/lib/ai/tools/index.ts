import { tool } from "ai";
import type { ToolSet } from "ai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createProject } from "./createProject";
import { createDriveFolder } from "./createDriveFolder";
import { getDashboard } from "./getDashboard";
import { searchDocuments } from "./searchDocuments";
import {
  defineTool,
  type ToolContext,
  type ToolDefinition,
} from "./tool-definition";

export interface ToolsContext extends ToolContext {
  supabase: SupabaseClient;
}

const registry = [
  createProject,
  createDriveFolder,
  getDashboard,
  searchDocuments,
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

export { createProject, createDriveFolder, getDashboard, searchDocuments };
export { defineTool };
export type { ToolContext, ToolDefinition };
