import { tool } from "ai";
import type { ToolSet } from "ai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createProject } from "./createProject";
import { getDashboard } from "./getDashboard";

export interface ToolContext {
  supabase: Pick<SupabaseClient, "from">;
  tenantId: string;
  userId: string;
}

export interface ToolsContext extends ToolContext {
  supabase: SupabaseClient;
}

export interface ToolDefinition<TParams extends z.ZodType, TResult> {
  name: string;
  description: string;
  parameters: TParams;
  execute: (
    params: z.infer<TParams>,
    context: ToolContext
  ) => Promise<TResult>;
}

export function defineTool<TParams extends z.ZodType, TResult>(
  toolDefinition: ToolDefinition<TParams, TResult>
): ToolDefinition<TParams, TResult> {
  return toolDefinition;
}

const registry = [createProject, getDashboard] as const;

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

export { createProject, getDashboard };
