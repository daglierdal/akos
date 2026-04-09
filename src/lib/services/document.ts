/**
 * Document service — single source of business logic for document operations.
 * Service layer — DB queries live here, NOT in Server Actions or AI tools.
 *
 * TODO Faz 0.1 schema migration: add department/file_name columns and remove
 * tenant_id once the documents table is updated to Faz 0.1 schema.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type DbClient = SupabaseClient<Database>;

export async function getDocuments(supabase: DbClient, projectId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select(
      "id, original_filename, category, mime_type, file_size, created_at"
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch documents: ${error.message}`);
  return data ?? [];
}

export async function getDocumentById(supabase: DbClient, documentId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("id, original_filename, category, storage_path, mime_type, project_id")
    .eq("id", documentId)
    .single();

  if (error) throw new Error(`Failed to fetch document: ${error.message}`);
  return data;
}
