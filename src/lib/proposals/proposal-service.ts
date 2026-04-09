import type { SupabaseClient } from "@supabase/supabase-js";
import type { drive_v3 } from "@/lib/drive/client";
import { createFolder, getDriveClient } from "@/lib/drive/client";
import type { Database } from "@/lib/supabase/database.types";

type TypedSupabase = SupabaseClient<Database>;
type ProposalRow = Database["public"]["Tables"]["proposals"]["Row"];
type ProposalInsert = Database["public"]["Tables"]["proposals"]["Insert"];
type ProposalBoqItemRow = Database["public"]["Tables"]["proposal_boq_items"]["Row"];
type ProposalBoqItemInsert = Database["public"]["Tables"]["proposal_boq_items"]["Insert"];
type BoqItemRow = Database["public"]["Tables"]["boq_items"]["Row"];
type DisciplineRow = Database["public"]["Tables"]["boq_disciplines"]["Row"];
type CategoryRow = Database["public"]["Tables"]["boq_categories"]["Row"];
type SubcategoryRow = Database["public"]["Tables"]["boq_subcategories"]["Row"];
type DriveFileInsert = Database["public"]["Tables"]["drive_files"]["Insert"];

const GOOGLE_DRIVE_FOLDER_MIME = "application/vnd.google-apps.folder";
const REVISION_SUBFOLDERS = [
  "01_Input",
  "02_BOQ_Working",
  "03_RFQ_and_Quotes",
  "04_Draft",
  "05_Approval",
  "06_Submitted",
] as const;
const REDUCED_VAT_HINTS = [
  "mobilya",
  "furniture",
  "beyaz esya",
  "white goods",
  "ankastre",
  "appliance",
  "fixtures",
];

export interface ProposalCalculationLine {
  proposalBoqItemId: string;
  boqItemId: string;
  discipline: string;
  quantity: number;
  unitCost: number;
  lineCost: number;
  linePrice: number;
  vatRate: number;
  lineVat: number;
  totalWithVat: number;
}

export interface ProposalCalculationTotals {
  totalCost: number;
  marginPercent: number;
  marginAmount: number;
  proposalDiscountAmount: number;
  totalPrice: number;
  totalVat: number;
  grandTotal: number;
}

export interface DisciplineSummary {
  discipline: string;
  cost: number;
  price: number;
  vat: number;
  total: number;
}

export interface ProposalSummary {
  proposal: ProposalRow;
  totals: ProposalCalculationTotals;
  lines: ProposalCalculationLine[];
  disciplineSummary: DisciplineSummary[];
}

interface ProjectContext {
  projectId: string;
  projectName: string;
  tenantId: string;
  tenantName: string;
  projectCode: string;
}

interface CalculationInputLine {
  proposalBoqItemId: string;
  boqItemId: string;
  quantity: number;
  malzemeBf: number;
  iscilikBf: number;
  isExcluded: boolean;
  itemDiscountType: string | null;
  itemDiscountValue: number;
  vatRate: number;
  discipline: string;
}

interface CalculationOptions {
  marginPercent: number;
  proposalDiscountType: string | null;
  proposalDiscountValue: number;
}

function toNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function escapeDriveQueryValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function sanitizeSegment(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, " ")
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

function tokenize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function getRevisionCode(revisionNo: number) {
  return `REV-${String(revisionNo).padStart(2, "0")}`;
}

function applyDiscount(
  amount: number,
  discountType: string | null | undefined,
  discountValue: number | null | undefined
) {
  const normalizedValue = toNumber(discountValue);

  if (normalizedValue <= 0 || amount <= 0) {
    return 0;
  }

  if (discountType === "percentage") {
    return Math.min(amount, (amount * normalizedValue) / 100);
  }

  if (discountType === "fixed") {
    return Math.min(amount, normalizedValue);
  }

  return 0;
}

export function resolveProposalVatRate(input: {
  discipline?: string | null;
  description?: string | null;
  category?: string | null;
}) {
  const haystack = `${input.discipline ?? ""} ${input.category ?? ""} ${input.description ?? ""}`
    .toLowerCase()
    .trim();

  return REDUCED_VAT_HINTS.some((hint) => haystack.includes(hint)) ? 0.1 : 0.2;
}

export function computeProposalTotals(
  lines: CalculationInputLine[],
  options: CalculationOptions
): {
  totals: ProposalCalculationTotals;
  lines: ProposalCalculationLine[];
  disciplineSummary: DisciplineSummary[];
} {
  const marginMultiplier = 1 + toNumber(options.marginPercent) / 100;

  const activeLines = lines
    .filter((line) => !line.isExcluded)
    .map((line) => {
      const quantity = toNumber(line.quantity);
      const unitCost = roundCurrency(toNumber(line.malzemeBf) + toNumber(line.iscilikBf));
      const grossCost = roundCurrency(quantity * unitCost);
      const itemDiscountAmount = applyDiscount(
        grossCost,
        line.itemDiscountType,
        line.itemDiscountValue
      );
      const lineCost = roundCurrency(Math.max(0, grossCost - itemDiscountAmount));

      return {
        ...line,
        quantity,
        unitCost,
        lineCost,
      };
    });

  const totalCost = roundCurrency(
    activeLines.reduce((sum, line) => sum + line.lineCost, 0)
  );
  const marginAmount = roundCurrency(totalCost * (marginMultiplier - 1));
  const grossPrice = roundCurrency(totalCost + marginAmount);
  const proposalDiscountAmount = roundCurrency(
    applyDiscount(
      grossPrice,
      options.proposalDiscountType,
      options.proposalDiscountValue
    )
  );

  const pricedLines = activeLines.map<ProposalCalculationLine>((line) => {
    const share = totalCost > 0 ? line.lineCost / totalCost : 0;
    const lineGrossPrice = roundCurrency(line.lineCost * marginMultiplier);
    const allocatedDiscount = roundCurrency(proposalDiscountAmount * share);
    const linePrice = roundCurrency(Math.max(0, lineGrossPrice - allocatedDiscount));
    const lineVat = roundCurrency(linePrice * line.vatRate);
    const totalWithVat = roundCurrency(linePrice + lineVat);

    return {
      proposalBoqItemId: line.proposalBoqItemId,
      boqItemId: line.boqItemId,
      discipline: line.discipline,
      quantity: line.quantity,
      unitCost: line.unitCost,
      lineCost: line.lineCost,
      linePrice,
      vatRate: line.vatRate,
      lineVat,
      totalWithVat,
    };
  });

  const totalPrice = roundCurrency(
    pricedLines.reduce((sum, line) => sum + line.linePrice, 0)
  );
  const totalVat = roundCurrency(pricedLines.reduce((sum, line) => sum + line.lineVat, 0));
  const grandTotal = roundCurrency(totalPrice + totalVat);

  const disciplineMap = new Map<string, DisciplineSummary>();

  for (const line of pricedLines) {
    const current = disciplineMap.get(line.discipline) ?? {
      discipline: line.discipline,
      cost: 0,
      price: 0,
      vat: 0,
      total: 0,
    };

    current.cost = roundCurrency(current.cost + line.lineCost);
    current.price = roundCurrency(current.price + line.linePrice);
    current.vat = roundCurrency(current.vat + line.lineVat);
    current.total = roundCurrency(current.total + line.totalWithVat);

    disciplineMap.set(line.discipline, current);
  }

  return {
    totals: {
      totalCost,
      marginPercent: toNumber(options.marginPercent),
      marginAmount,
      proposalDiscountAmount,
      totalPrice,
      totalVat,
      grandTotal,
    },
    lines: pricedLines,
    disciplineSummary: [...disciplineMap.values()].sort((a, b) =>
      a.discipline.localeCompare(b.discipline, "tr")
    ),
  };
}

async function getProjectContext(
  supabase: TypedSupabase,
  projectId: string,
  tenantId: string
): Promise<ProjectContext> {
  const [{ data: project, error: projectError }, { data: tenant, error: tenantError }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id, name, project_code")
        .eq("id", projectId)
        .eq("tenant_id", tenantId)
        .single(),
      supabase
        .from("tenants")
        .select("id, name")
        .eq("id", tenantId)
        .single(),
    ]);

  if (projectError || !project) {
    throw new Error(projectError?.message ?? "Project not found.");
  }

  if (tenantError || !tenant) {
    throw new Error(tenantError?.message ?? "Tenant not found.");
  }

  return {
    projectId: project.id,
    projectName: project.name,
    tenantId,
    tenantName: tenant.name,
    projectCode: project.project_code,
  };
}

async function findFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId?: string
) {
  const conditions = [
    "mimeType='application/vnd.google-apps.folder'",
    `name='${escapeDriveQueryValue(name)}'`,
    "trashed=false",
  ];

  if (parentId) {
    conditions.push(`'${escapeDriveQueryValue(parentId)}' in parents`);
  }

  const { data } = await drive.files.list({
    q: conditions.join(" and "),
    fields: "files(id,name,mimeType,parents,webViewLink)",
    pageSize: 1,
  });

  return data.files?.[0]
    ? {
        id: data.files[0].id ?? "",
        name: data.files[0].name ?? name,
        mimeType: data.files[0].mimeType,
        parents: data.files[0].parents,
        webViewLink: data.files[0].webViewLink,
      }
    : null;
}

async function trackDriveFolder(supabase: TypedSupabase, payload: DriveFileInsert) {
  const { data: existing, error: lookupError } = await supabase
    .from("drive_files")
    .select("id")
    .eq("tenant_id", payload.tenant_id)
    .eq("drive_file_id", payload.drive_file_id)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Drive folder lookup failed: ${lookupError.message}`);
  }

  if (existing) {
    return;
  }

  const { error } = await supabase.from("drive_files").insert(payload);

  if (error) {
    throw new Error(`Drive folder record save failed: ${error.message}`);
  }
}

async function ensureFolder(
  supabase: TypedSupabase,
  drive: drive_v3.Drive,
  options: {
    name: string;
    tenantId: string;
    projectId: string;
    proposalId: string | null;
    parentId?: string;
    revisionLabel: string;
    documentType: string;
  }
) {
  const existing = await findFolder(drive, options.name, options.parentId);
  const folder = existing ?? (await createFolder(drive, options.name, options.parentId));

  await trackDriveFolder(supabase, {
    tenant_id: options.tenantId,
    project_id: options.projectId,
    proposal_id: options.proposalId,
    file_role: "folder",
    document_type: options.documentType,
    discipline: null,
    revision_label: options.revisionLabel,
    drive_file_id: folder.id,
    drive_parent_id: options.parentId ?? null,
    mime_type: folder.mimeType ?? GOOGLE_DRIVE_FOLDER_MIME,
    web_view_link: folder.webViewLink ?? null,
    size_bytes: null,
  });

  return folder;
}

async function ensureRevisionFolderStructure(
  supabase: TypedSupabase,
  context: ProjectContext,
  proposalId: string,
  revisionCode: string
) {
  const drive = await getDriveClient();
  const rootFolderName = `${sanitizeSegment(context.projectCode)}_${context.projectName}`;
  const rootFolder = await ensureFolder(supabase, drive, {
    name: rootFolderName,
    tenantId: context.tenantId,
    projectId: context.projectId,
    proposalId: null,
    revisionLabel: rootFolderName,
    documentType: context.projectName,
  });
  const proposalFolder = await ensureFolder(supabase, drive, {
    name: "01_Proposal",
    tenantId: context.tenantId,
    projectId: context.projectId,
    proposalId: null,
    parentId: rootFolder.id,
    revisionLabel: `${rootFolderName}/01_Proposal`,
    documentType: context.projectName,
  });
  const revisionFolder = await ensureFolder(supabase, drive, {
    name: revisionCode,
    tenantId: context.tenantId,
    projectId: context.projectId,
    proposalId,
    parentId: proposalFolder.id,
    revisionLabel: `${rootFolderName}/01_Proposal/${revisionCode}`,
    documentType: context.projectName,
  });

  for (const subfolder of REVISION_SUBFOLDERS) {
    await ensureFolder(supabase, drive, {
      name: subfolder,
      tenantId: context.tenantId,
      projectId: context.projectId,
      proposalId,
      parentId: revisionFolder.id,
      revisionLabel: `${rootFolderName}/01_Proposal/${revisionCode}/${subfolder}`,
      documentType: context.projectName,
    });
  }

  return revisionFolder.id;
}

async function ensureArchiveFolder(
  supabase: TypedSupabase,
  context: ProjectContext,
  previousProposalId: string,
  previousRevisionCode: string
) {
  const drive = await getDriveClient();
  const rootFolderName = `${sanitizeSegment(context.projectCode)}_${context.projectName}`;
  const rootFolder = await ensureFolder(supabase, drive, {
    name: rootFolderName,
    tenantId: context.tenantId,
    projectId: context.projectId,
    proposalId: null,
    revisionLabel: rootFolderName,
    documentType: context.projectName,
  });
  const archiveFolder = await ensureFolder(supabase, drive, {
    name: "90_Archive",
    tenantId: context.tenantId,
    projectId: context.projectId,
    proposalId: null,
    parentId: rootFolder.id,
    revisionLabel: `${rootFolderName}/90_Archive`,
    documentType: context.projectName,
  });

  await ensureFolder(supabase, drive, {
    name: previousRevisionCode,
    tenantId: context.tenantId,
    projectId: context.projectId,
    proposalId: previousProposalId,
    parentId: archiveFolder.id,
    revisionLabel: `${rootFolderName}/90_Archive/${previousRevisionCode}`,
    documentType: context.projectName,
  });
}

async function listProjectBoqItems(
  supabase: TypedSupabase,
  projectId: string,
  tenantId: string
) {
  const { data: disciplines, error: disciplinesError } = await supabase
    .from("boq_disciplines")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("project_id", projectId);

  if (disciplinesError) {
    throw new Error(`BOQ disciplines lookup failed: ${disciplinesError.message}`);
  }

  const disciplineIds = (disciplines ?? []).map((row) => row.id);

  if (disciplineIds.length === 0) {
    return [];
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("boq_categories")
    .select("id")
    .in("discipline_id", disciplineIds);

  if (categoriesError) {
    throw new Error(`BOQ categories lookup failed: ${categoriesError.message}`);
  }

  const categoryIds = (categories ?? []).map((row) => row.id);

  if (categoryIds.length === 0) {
    return [];
  }

  const { data: subcategories, error: subcategoriesError } = await supabase
    .from("boq_subcategories")
    .select("id")
    .in("category_id", categoryIds);

  if (subcategoriesError) {
    throw new Error(`BOQ subcategories lookup failed: ${subcategoriesError.message}`);
  }

  const subcategoryIds = (subcategories ?? []).map((row) => row.id);

  if (subcategoryIds.length === 0) {
    return [];
  }

  const { data: boqItems, error: boqItemsError } = await supabase
    .from("boq_items")
    .select(
      "id, tenant_id, subcategory_id, miktar, malzeme_bf, iscilik_bf, is_tanimi, aciklama"
    )
    .in("subcategory_id", subcategoryIds)
    .eq("tenant_id", tenantId);

  if (boqItemsError) {
    throw new Error(`BOQ items lookup failed: ${boqItemsError.message}`);
  }

  return boqItems ?? [];
}

async function buildProposalBoqSnapshot(
  supabase: TypedSupabase,
  proposal: Pick<ProposalRow, "id" | "project_id" | "tenant_id" | "revision_no">
) {
  const boqItems = await listProjectBoqItems(
    supabase,
    proposal.project_id,
    proposal.tenant_id
  );

  if (boqItems.length === 0) {
    return;
  }

  const payload: ProposalBoqItemInsert[] = boqItems.map((item) => ({
    tenant_id: proposal.tenant_id,
    proposal_id: proposal.id,
    revision_no: proposal.revision_no,
    boq_item_id: item.id,
    quantity: item.miktar,
    malzeme_bf: item.malzeme_bf,
    iscilik_bf: item.iscilik_bf,
    is_excluded: false,
    discount_type: null,
    discount_value: null,
  }));

  const { error } = await supabase.from("proposal_boq_items").insert(payload);

  if (error) {
    throw new Error(`Proposal BOQ snapshot save failed: ${error.message}`);
  }
}

async function getProposalById(supabase: TypedSupabase, proposalId: string) {
  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", proposalId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Proposal not found.");
  }

  return data;
}

async function getProposalItemsWithContext(
  supabase: TypedSupabase,
  proposal: ProposalRow
) {
  const { data: proposalItems, error: proposalItemsError } = await supabase
    .from("proposal_boq_items")
    .select("*")
    .eq("proposal_id", proposal.id)
    .eq("tenant_id", proposal.tenant_id)
    .eq("revision_no", proposal.revision_no);

  if (proposalItemsError) {
    throw new Error(`Proposal BOQ items lookup failed: ${proposalItemsError.message}`);
  }

  const proposalBoqItems = proposalItems ?? [];
  const boqItemIds = proposalBoqItems.map((row) => row.boq_item_id);

  if (boqItemIds.length === 0) {
    return {
      proposalItems: proposalBoqItems,
      boqItems: new Map<string, BoqItemRow>(),
      disciplines: new Map<string, string>(),
      categories: new Map<string, string>(),
    };
  }

  const { data: boqItems, error: boqItemsError } = await supabase
    .from("boq_items")
    .select("*")
    .in("id", boqItemIds);

  if (boqItemsError) {
    throw new Error(`BOQ item context lookup failed: ${boqItemsError.message}`);
  }

  const boqById = new Map((boqItems ?? []).map((item) => [item.id, item]));
  const subcategoryIds = [...new Set((boqItems ?? []).map((item) => item.subcategory_id))];
  const { data: subcategories, error: subcategoriesError } = await supabase
    .from("boq_subcategories")
    .select("*")
    .in("id", subcategoryIds);

  if (subcategoriesError) {
    throw new Error(`BOQ subcategory lookup failed: ${subcategoriesError.message}`);
  }

  const subcategoryById = new Map((subcategories ?? []).map((item) => [item.id, item]));
  const categoryIds = [...new Set((subcategories ?? []).map((item) => item.category_id))];
  const { data: categories, error: categoriesError } = await supabase
    .from("boq_categories")
    .select("*")
    .in("id", categoryIds);

  if (categoriesError) {
    throw new Error(`BOQ category lookup failed: ${categoriesError.message}`);
  }

  const categoryById = new Map((categories ?? []).map((item) => [item.id, item]));
  const disciplineIds = [...new Set((categories ?? []).map((item) => item.discipline_id))];
  const { data: disciplines, error: disciplinesError } = await supabase
    .from("boq_disciplines")
    .select("*")
    .in("id", disciplineIds);

  if (disciplinesError) {
    throw new Error(`BOQ discipline lookup failed: ${disciplinesError.message}`);
  }

  const disciplineById = new Map((disciplines ?? []).map((item) => [item.id, item]));
  const disciplineNameByBoqItemId = new Map<string, string>();
  const categoryNameByBoqItemId = new Map<string, string>();

  for (const boqItem of boqItems ?? []) {
    const subcategory = subcategoryById.get(boqItem.subcategory_id);
    const category = subcategory ? categoryById.get(subcategory.category_id) : undefined;
    const discipline = category ? disciplineById.get(category.discipline_id) : undefined;

    disciplineNameByBoqItemId.set(boqItem.id, discipline?.name?.trim() || "Genel");
    categoryNameByBoqItemId.set(boqItem.id, category?.name?.trim() || "Genel");
  }

  return {
    proposalItems: proposalBoqItems,
    boqItems: boqById,
    disciplines: disciplineNameByBoqItemId,
    categories: categoryNameByBoqItemId,
  };
}

export async function createProposal(
  supabase: TypedSupabase,
  projectId: string,
  tenantId: string
) {
  const context = await getProjectContext(supabase, projectId, tenantId);

  const payload: ProposalInsert = {
    tenant_id: tenantId,
    project_id: projectId,
    revision_no: 0,
    revision_code: getRevisionCode(0),
    status: "draft",
  };

  const { data: proposal, error } = await supabase
    .from("proposals")
    .insert(payload)
    .select("*")
    .single();

  if (error || !proposal) {
    throw new Error(error?.message ?? "Proposal creation failed.");
  }

  const driveRevisionFolderId = await ensureRevisionFolderStructure(
    supabase,
    context,
    proposal.id,
    proposal.revision_code
  );

  const { error: updateError } = await supabase
    .from("proposals")
    .update({ drive_revision_folder_id: driveRevisionFolderId })
    .eq("id", proposal.id);

  if (updateError) {
    throw new Error(`Proposal folder update failed: ${updateError.message}`);
  }

  await buildProposalBoqSnapshot(supabase, proposal);

  return {
    ...proposal,
    drive_revision_folder_id: driveRevisionFolderId,
  };
}

export async function reviseProposal(supabase: TypedSupabase, proposalId: string) {
  const previousProposal = await getProposalById(supabase, proposalId);
  const nextRevisionNo = previousProposal.revision_no + 1;
  const nextRevisionCode = getRevisionCode(nextRevisionNo);
  const context = await getProjectContext(
    supabase,
    previousProposal.project_id,
    previousProposal.tenant_id
  );

  const { data: snapshotRows, error: snapshotError } = await supabase
    .from("proposal_boq_items")
    .select("*")
    .eq("proposal_id", previousProposal.id)
    .eq("revision_no", previousProposal.revision_no)
    .eq("tenant_id", previousProposal.tenant_id);

  if (snapshotError) {
    throw new Error(`Previous proposal snapshot lookup failed: ${snapshotError.message}`);
  }

  const { data: revisedProposal, error: insertError } = await supabase
    .from("proposals")
    .insert({
      tenant_id: previousProposal.tenant_id,
      project_id: previousProposal.project_id,
      revision_no: nextRevisionNo,
      revision_code: nextRevisionCode,
      status: "draft",
      margin_percent: previousProposal.margin_percent,
      discount_type: previousProposal.discount_type,
      discount_value: previousProposal.discount_value,
    })
    .select("*")
    .single();

  if (insertError || !revisedProposal) {
    throw new Error(insertError?.message ?? "Proposal revision creation failed.");
  }

  if ((snapshotRows ?? []).length > 0) {
    const payload: ProposalBoqItemInsert[] = (snapshotRows ?? []).map((row) => ({
      tenant_id: row.tenant_id,
      proposal_id: revisedProposal.id,
      revision_no: nextRevisionNo,
      boq_item_id: row.boq_item_id,
      quantity: row.quantity,
      malzeme_bf: row.malzeme_bf,
      iscilik_bf: row.iscilik_bf,
      is_excluded: row.is_excluded,
      discount_type: row.discount_type,
      discount_value: row.discount_value,
    }));

    const { error: copyError } = await supabase
      .from("proposal_boq_items")
      .insert(payload);

    if (copyError) {
      throw new Error(`Proposal revision snapshot copy failed: ${copyError.message}`);
    }
  }

  await ensureArchiveFolder(
    supabase,
    context,
    previousProposal.id,
    previousProposal.revision_code
  );

  const driveRevisionFolderId = await ensureRevisionFolderStructure(
    supabase,
    context,
    revisedProposal.id,
    revisedProposal.revision_code
  );

  const { error: updateError } = await supabase
    .from("proposals")
    .update({ drive_revision_folder_id: driveRevisionFolderId })
    .eq("id", revisedProposal.id);

  if (updateError) {
    throw new Error(`Proposal revision folder update failed: ${updateError.message}`);
  }

  return {
    ...revisedProposal,
    drive_revision_folder_id: driveRevisionFolderId,
    previousProposalId: previousProposal.id,
  };
}

export async function calculateProposal(
  supabase: TypedSupabase,
  proposalId: string
) {
  const proposal = await getProposalById(supabase, proposalId);
  const context = await getProposalItemsWithContext(supabase, proposal);

  const calculationInput: CalculationInputLine[] = context.proposalItems.map((row) => {
    const boqItem = context.boqItems.get(row.boq_item_id);
    const description = boqItem?.is_tanimi ?? boqItem?.aciklama ?? "";
    const discipline = context.disciplines.get(row.boq_item_id) ?? "Genel";
    const category = context.categories.get(row.boq_item_id) ?? "Genel";

    return {
      proposalBoqItemId: row.id,
      boqItemId: row.boq_item_id,
      quantity: toNumber(row.quantity ?? boqItem?.miktar),
      malzemeBf: toNumber(row.malzeme_bf ?? boqItem?.malzeme_bf),
      iscilikBf: toNumber(row.iscilik_bf ?? boqItem?.iscilik_bf),
      isExcluded: row.is_excluded,
      itemDiscountType: row.discount_type,
      itemDiscountValue: toNumber(row.discount_value),
      vatRate: resolveProposalVatRate({
        discipline,
        category,
        description,
      }),
      discipline,
    };
  });

  const summary = computeProposalTotals(calculationInput, {
    marginPercent: toNumber(proposal.margin_percent),
    proposalDiscountType: proposal.discount_type,
    proposalDiscountValue: toNumber(proposal.discount_value),
  });

  const { error: updateError } = await supabase
    .from("proposals")
    .update({
      total_cost: summary.totals.totalCost,
      total_price: summary.totals.totalPrice,
      total_vat: summary.totals.totalVat,
    })
    .eq("id", proposal.id);

  if (updateError) {
    throw new Error(`Proposal totals update failed: ${updateError.message}`);
  }

  return {
    proposal: {
      ...proposal,
      total_cost: summary.totals.totalCost,
      total_price: summary.totals.totalPrice,
      total_vat: summary.totals.totalVat,
    },
    totals: summary.totals,
    lines: summary.lines,
    disciplineSummary: summary.disciplineSummary,
  } satisfies ProposalSummary;
}

export async function getProposalSummary(
  supabase: TypedSupabase,
  proposalId: string
) {
  return calculateProposal(supabase, proposalId);
}

export async function submitProposal(
  supabase: TypedSupabase,
  proposalId: string
) {
  await calculateProposal(supabase, proposalId);

  const submittedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("proposals")
    .update({
      status: "submitted",
      submitted_at: submittedAt,
    })
    .eq("id", proposalId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Proposal submit failed.");
  }

  return data;
}
