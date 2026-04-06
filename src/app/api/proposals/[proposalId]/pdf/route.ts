import { generateProposalPDF } from "@/lib/proposals/pdf-service";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  context: { params: Promise<{ proposalId: string }> }
) {
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

  const { proposalId } = await context.params;
  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .select("id, tenant_id, revision_code")
    .eq("id", proposalId)
    .eq("tenant_id", tenantId)
    .single();

  if (proposalError || !proposal) {
    return Response.json({ error: proposalError?.message ?? "Proposal not found" }, { status: 404 });
  }

  const pdfBuffer = await generateProposalPDF(supabase, proposalId);

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${proposal.revision_code}_proposal.pdf"`,
    },
  });
}
