import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/lib/supabase/database.types";

export interface ToolContext {
  supabase: SupabaseClient<Database>;
  userId: string;
  /**
   * @deprecated tenantId is being phased out. New tools must not use this field.
   * Existing tools still use it until they are rewritten in Faz 0.1 Adım 2+.
   */
  tenantId: string;
  role?: string | null;
}

export interface ToolDefinition<TParams extends z.ZodType, TResult> {
  name: string;
  description: string;
  needsApproval?: boolean;
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
