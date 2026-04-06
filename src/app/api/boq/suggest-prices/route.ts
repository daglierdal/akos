import { suggestPrices } from "@/lib/boq/price-service";
import { createClient } from "@/lib/supabase/server";

type SuggestionDecision = "accept" | "reject";
type SuggestionConfidence = "high" | "medium" | "low" | "none";

interface DecisionRequestBody {
  projectId?: string;
  boqItemId?: string;
  decision?: SuggestionDecision;
}

function getConfidenceLevel(input: {
  materialConfidence?: string | null;
  laborConfidence?: string | null;
}): SuggestionConfidence {
  const values = [input.materialConfidence, input.laborConfidence];

  if (values.includes("yuksek")) {
    return "high";
  }

  if (values.includes("orta")) {
    return "medium";
  }

  if (values.includes("dusuk")) {
    return "low";
  }

  return "none";
}

async function requireSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
      supabase,
      tenantId: null,
    };
  }

  const tenantId = session.user.app_metadata?.tenant_id;

  if (typeof tenantId !== "string" || tenantId.length === 0) {
    return {
      error: Response.json({ error: "Tenant context is missing" }, { status: 403 }),
      supabase,
      tenantId: null,
    };
  }

  return {
    error: null,
    supabase,
    tenantId,
  };
}

async function getLatestProposal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tenantId: string,
  projectId: string
) {
  const { data, error } = await supabase
    .from("proposals")
    .select("id, revision_no")
    .eq("tenant_id", tenantId)
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Latest proposal lookup failed: ${error.message}`);
  }

  return data;
}

async function getSuggestionPayload(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tenantId: string,
  projectId: string
) {
  const latestProposal = await getLatestProposal(supabase, tenantId, projectId);

  if (!latestProposal) {
    throw new Error("Bu proje için aktif teklif bulunamadı.");
  }

  const [suggestions, { data: proposalItems, error: proposalItemsError }] = await Promise.all([
    suggestPrices(supabase, projectId),
    supabase
      .from("proposal_boq_items")
      .select("id, boq_item_id, malzeme_bf, iscilik_bf")
      .eq("tenant_id", tenantId)
      .eq("proposal_id", latestProposal.id)
      .eq("revision_no", latestProposal.revision_no),
  ]);

  if (proposalItemsError) {
    throw new Error(`Proposal BOQ items lookup failed: ${proposalItemsError.message}`);
  }

  const proposalItemByBoqItemId = new Map(
    (proposalItems ?? []).map((item) => [item.boq_item_id, item])
  );

  return {
    proposalId: latestProposal.id,
    revisionNo: latestProposal.revision_no,
    suggestions: suggestions
      .filter((suggestion) => proposalItemByBoqItemId.has(suggestion.boqItemId))
      .map((suggestion) => {
        const proposalItem = proposalItemByBoqItemId.get(suggestion.boqItemId)!;
        const currentMalzemeBf = proposalItem.malzeme_bf ?? 0;
        const currentIscilikBf = proposalItem.iscilik_bf ?? 0;
        const suggestedMalzemeBf = suggestion.suggestedMalzemeBf ?? currentMalzemeBf;
        const suggestedIscilikBf = suggestion.suggestedIscilikBf ?? currentIscilikBf;

        return {
          id: proposalItem.id,
          boqItemId: suggestion.boqItemId,
          poz_no: suggestion.pozNo ?? "-",
          is_tanimi: suggestion.itemName ?? "Tanımsız kalem",
          currentMalzemeBf,
          currentIscilikBf,
          currentTotalPrice: currentMalzemeBf + currentIscilikBf,
          suggestedMalzemeBf,
          suggestedIscilikBf,
          suggestedTotalPrice: suggestedMalzemeBf + suggestedIscilikBf,
          confidence: getConfidenceLevel({
            materialConfidence: suggestion.materialMatch?.confidence,
            laborConfidence: suggestion.laborMatch?.confidence,
          }),
          warnings: suggestion.warnings,
        };
      }),
  };
}

export async function GET(req: Request) {
  const auth = await requireSession();

  if (auth.error || !auth.tenantId) {
    return auth.error ?? Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId")?.trim();

  if (!projectId) {
    return Response.json({ error: "projectId is required" }, { status: 400 });
  }

  try {
    const payload = await getSuggestionPayload(auth.supabase, auth.tenantId, projectId);
    return Response.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Price suggestions could not be loaded.";
    const status = message.includes("aktif teklif") ? 404 : 500;
    return Response.json({ error: message }, { status });
  }
}

export async function POST(req: Request) {
  const auth = await requireSession();

  if (auth.error || !auth.tenantId) {
    return auth.error ?? Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as DecisionRequestBody;
  const projectId = body.projectId?.trim();
  const boqItemId = body.boqItemId?.trim();
  const decision = body.decision;

  if (!projectId || !boqItemId || (decision !== "accept" && decision !== "reject")) {
    return Response.json({ error: "projectId, boqItemId and decision are required" }, {
      status: 400,
    });
  }

  try {
    const payload = await getSuggestionPayload(auth.supabase, auth.tenantId, projectId);
    const suggestion = payload.suggestions.find((item) => item.boqItemId === boqItemId);

    if (!suggestion) {
      return Response.json({ error: "Suggestion not found" }, { status: 404 });
    }

    const updatePayload = {
      malzeme_bf:
        decision === "accept" ? suggestion.suggestedMalzemeBf : suggestion.currentMalzemeBf,
      iscilik_bf:
        decision === "accept" ? suggestion.suggestedIscilikBf : suggestion.currentIscilikBf,
    };

    const { data, error } = await auth.supabase
      .from("proposal_boq_items")
      .update(updatePayload)
      .eq("tenant_id", auth.tenantId)
      .eq("proposal_id", payload.proposalId)
      .eq("revision_no", payload.revisionNo)
      .eq("boq_item_id", boqItemId)
      .select("id, boq_item_id, malzeme_bf, iscilik_bf")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Price decision could not be saved.");
    }

    return Response.json({
      success: true,
      proposalId: payload.proposalId,
      revisionNo: payload.revisionNo,
      item: data,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Price decision could not be saved.",
      },
      { status: 500 }
    );
  }
}
