import { BoqImportWizard } from "@/components/boq/boq-import-wizard";
import { BoqTable } from "@/components/boq/boq-table";
import { PriceSuggestionPanel } from "@/components/boq/price-suggestion-panel";

export default async function BOQPage({
  searchParams,
}: {
  searchParams?: Promise<{ projectId?: string }>;
}) {
  const params = await searchParams;
  const selectedProjectId = params?.projectId ?? null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">BOQ</h1>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.8fr)]">
        <BoqTable />
        <div className="space-y-6">
          <BoqImportWizard projectId={selectedProjectId} />
          <PriceSuggestionPanel projectId={selectedProjectId} />
        </div>
      </div>
    </div>
  );
}
