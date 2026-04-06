import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export interface ToolContext {
  supabase: SupabaseClient;
  tenantId: string;
  userId: string;
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
