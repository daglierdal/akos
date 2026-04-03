import { z } from "zod";

export interface ToolDefinition<
  TParams extends z.ZodType,
  TResult,
> {
  name: string;
  description: string;
  parameters: TParams;
  execute: (params: z.infer<TParams>) => Promise<TResult>;
}

export function defineTool<TParams extends z.ZodType, TResult>(
  tool: ToolDefinition<TParams, TResult>,
): ToolDefinition<TParams, TResult> {
  return tool;
}

export { createProject } from "./createProject";
export { getDashboard } from "./getDashboard";
