import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type TypedSupabase = SupabaseClient<Database>;

function normalizePrefix(prefix: string | null | undefined) {
  const cleaned = (prefix ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "");

  return cleaned || "PRJ";
}

export function formatProjectSequence(sequence: number) {
  return String(Math.max(1, sequence)).padStart(4, "0");
}

export function formatProjectCode(input: {
  prefix?: string | null;
  year?: number;
  sequence: number;
}) {
  const year = input.year ?? new Date().getUTCFullYear();
  return `${normalizePrefix(input.prefix)}-${year}-${formatProjectSequence(input.sequence)}`;
}

export async function generateProjectCode(
  supabase: TypedSupabase,
  tenantId: string,
  options?: {
    year?: number;
  },
) {
  const year = options?.year ?? new Date().getUTCFullYear();
  const startOfYear = `${year}-01-01T00:00:00.000Z`;
  const startOfNextYear = `${year + 1}-01-01T00:00:00.000Z`;

  const [
    { data: tenant, error: tenantError },
    { count: projectCount, error: projectCountError },
  ] = await Promise.all([
    supabase
      .from("tenants")
      .select("project_code_prefix")
      .eq("id", tenantId)
      .single(),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .gte("created_at", startOfYear)
      .lt("created_at", startOfNextYear),
  ]);

  if (tenantError || !tenant) {
    throw new Error(tenantError?.message ?? "Tenant lookup failed.");
  }

  if (projectCountError) {
    throw new Error(`Project code sequence failed: ${projectCountError.message}`);
  }

  return formatProjectCode({
    prefix: tenant.project_code_prefix,
    year,
    sequence: (projectCount ?? 0) + 1,
  });
}
