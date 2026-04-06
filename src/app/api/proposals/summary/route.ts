import { createClient } from "@/lib/supabase/server";
import { getProposalSummary } from "@/lib/proposals/proposal-service";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.app_metadata?.tenant_id;

  if (typeof tenantId !== "string" || tenantId.length === 0) {
    return Response.json({ error: "Tenant context is missing" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId")?.trim() || null;

  let proposalQuery = supabase
    .from("proposals")
    .select("id")
    .eq("tenant_id", tenantId)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (projectId) {
    proposalQuery = proposalQuery.eq("project_id", projectId);
  }

  const { data: proposal, error } = await proposalQuery.maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!proposal) {
    return Response.json({ error: "Proposal not found" }, { status: 404 });
  }

  const summary = await getProposalSummary(supabase, proposal.id);
  return Response.json(summary);
}
