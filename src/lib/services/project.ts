/**
 * Project service — single source of business logic for project operations.
 * AI tools and Server Actions call these functions; they do NOT contain DB
 * queries directly.
 *
 * TODO Faz 0.1 schema migration: remove tenant_id dependency once
 * the projects table is updated to use user_id-based RLS.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type DbClient = SupabaseClient<Database>;

export async function getProjects(supabase: DbClient) {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, project_code, budget, currency, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch projects: ${error.message}`);
  return data ?? [];
}

export async function getProjectById(supabase: DbClient, projectId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, project_code, budget, currency, status, customer_id")
    .eq("id", projectId)
    .single();

  if (error) throw new Error(`Failed to fetch project: ${error.message}`);
  return data;
}
