import * as XLSX from "xlsx";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { extractText } from "@/lib/documents/text-extractor";

type DbClient = Pick<SupabaseClient<Database>, "from">;
type PriceRecordRow = Database["public"]["Tables"]["price_records"]["Row"];
type BOQItemRow = Database["public"]["Tables"]["boq_items"]["Row"];
type DisciplineRow = Database["public"]["Tables"]["boq_disciplines"]["Row"];
type CategoryRow = Database["public"]["Tables"]["boq_categories"]["Row"];
type SubcategoryRow = Database["public"]["Tables"]["boq_subcategories"]["Row"];

export interface SearchPricesParams {
  itemName?: string;
  discipline?: string;
  city?: string;
}

export interface PriceSearchResult {
  prices: PriceRecordRow[];
  count: number;
}

export interface SuggestedPriceCandidate extends PriceRecordRow {
  confidence: "yuksek" | "orta" | "dusuk";
  stale: boolean;
  score: number;
  reasons: string[];
}

export interface SuggestedPriceItem {
  boqItemId: string;
  pozNo: string | null;
  itemName: string | null;
  birim: string | null;
  discipline: string | null;
  city: string | null;
  suggestedMalzemeBf: number | null;
  suggestedIscilikBf: number | null;
  materialMatch: SuggestedPriceCandidate | null;
  laborMatch: SuggestedPriceCandidate | null;
  warnings: string[];
}

export interface PriceListImportResult {
  success: boolean;
  priceListId: string;
  importedCount: number;
  warnings: string[];
}

interface PriceListRow {
  itemName: string;
  itemCategory: string | null;
  discipline: string | null;
  priceType: "malzeme" | "iscilik";
  unit: string | null;
  unitPrice: number;
  currency: string;
  city: string | null;
  supplierName: string | null;
  sourceDate: string | null;
}

interface BOQItemContext extends BOQItemRow {
  discipline_name: string | null;
  category_name: string | null;
  subcategory_name: string | null;
}

const PRICE_HEADER_ALIASES: Record<string, string[]> = {
  itemName: ["item name", "kalem", "urun", "iş kalemi", "is kalemi", "tanim"],
  itemCategory: ["item category", "kategori", "grup"],
  discipline: ["discipline", "disiplin", "bolum"],
  priceType: ["price type", "fiyat tipi", "tip"],
  unit: ["unit", "birim"],
  unitPrice: ["unit price", "fiyat", "birim fiyat", "bf"],
  currency: ["currency", "para birimi", "doviz", "döviz"],
  city: ["city", "sehir", "şehir", "lokasyon"],
  supplierName: ["supplier", "supplier name", "tedarikci", "tedarikçi"],
  sourceDate: ["date", "tarih", "price date"],
};

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9ğüşöçıİ\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const normalized = String(value ?? "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function toOptionalString(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeHeader(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ")
    .replace(/[_-]+/g, " ")
    .trim();
}

function pickField(row: Record<string, unknown>, field: keyof typeof PRICE_HEADER_ALIASES) {
  for (const [key, value] of Object.entries(row)) {
    if (PRICE_HEADER_ALIASES[field].includes(normalizeHeader(key))) {
      return value;
    }
  }

  return null;
}

function monthsDiff(from: Date, to: Date) {
  const monthDelta =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth());
  return monthDelta;
}

function inferConfidence(score: number, stale: boolean) {
  if (stale || score < 55) {
    return "dusuk" as const;
  }

  if (score >= 85) {
    return "yuksek" as const;
  }

  return "orta" as const;
}

export function scorePriceMatch(input: {
  boqItem: Pick<BOQItemContext, "is_tanimi" | "birim" | "poz_no" | "discipline_name">;
  priceRecord: Pick<
    PriceRecordRow,
    "item_name" | "unit" | "discipline" | "city" | "source_date"
  >;
  preferredCity: string | null;
}) {
  const boqName = normalizeText(input.boqItem.is_tanimi);
  const priceName = normalizeText(input.priceRecord.item_name);
  const boqDiscipline = normalizeText(input.boqItem.discipline_name);
  const priceDiscipline = normalizeText(input.priceRecord.discipline);
  const boqUnit = normalizeText(input.boqItem.birim);
  const priceUnit = normalizeText(input.priceRecord.unit);
  const preferredCity = normalizeText(input.preferredCity);
  const priceCity = normalizeText(input.priceRecord.city);

  let score = 0;
  const reasons: string[] = [];

  if (boqName && boqName === priceName) {
    score += 50;
    reasons.push("Ayni kalem");
  } else if (
    boqName &&
    priceName &&
    (boqName.includes(priceName) || priceName.includes(boqName))
  ) {
    score += 30;
    reasons.push("Benzer kalem");
  }

  if (boqDiscipline && priceDiscipline && boqDiscipline === priceDiscipline) {
    score += 15;
    reasons.push("Ayni disiplin");
  }

  if (boqUnit && priceUnit && boqUnit === priceUnit) {
    score += 10;
    reasons.push("Ayni birim");
  }

  if (preferredCity && priceCity && preferredCity === priceCity) {
    score += 20;
    reasons.push("Ayni sehir");
  }

  const sourceDate = input.priceRecord.source_date
    ? new Date(input.priceRecord.source_date)
    : null;
  const now = new Date();
  const ageInMonths = sourceDate ? monthsDiff(sourceDate, now) : Number.MAX_SAFE_INTEGER;

  if (ageInMonths <= 3) {
    score += 20;
    reasons.push("3 ay icinde");
  } else if (ageInMonths <= 6) {
    score += 10;
    reasons.push("6 ay icinde");
  }

  return {
    score,
    stale: ageInMonths > 6,
    confidence: inferConfidence(score, ageInMonths > 6),
    reasons,
  };
}

export async function searchPrices(
  supabase: DbClient,
  filters: SearchPricesParams
): Promise<PriceSearchResult> {
  let query = supabase
    .from("price_records")
    .select("*")
    .eq("is_current", true)
    .order("source_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.itemName?.trim()) {
    query = query.ilike("item_name", `%${filters.itemName.trim()}%`);
  }

  if (filters.discipline?.trim()) {
    query = query.ilike("discipline", `%${filters.discipline.trim()}%`);
  }

  if (filters.city?.trim()) {
    query = query.ilike("city", `%${filters.city.trim()}%`);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    throw new Error(`Price search failed: ${error.message}`);
  }

  return {
    prices: data ?? [],
    count: data?.length ?? 0,
  };
}

async function inferProjectCity(supabase: DbClient, projectId: string) {
  const { data, error } = await supabase
    .from("price_records")
    .select("city")
    .eq("project_id", projectId)
    .not("city", "is", null)
    .limit(100);

  if (error) {
    throw new Error(`Project city inference failed: ${error.message}`);
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.city) {
      continue;
    }

    counts.set(row.city, (counts.get(row.city) ?? 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

async function getProjectBOQItems(supabase: DbClient, projectId: string) {
  const [
    { data: disciplines, error: disciplinesError },
    { data: categories, error: categoriesError },
    { data: subcategories, error: subcategoriesError },
    { data: items, error: itemsError },
  ] = await Promise.all([
    supabase.from("boq_disciplines").select("*").eq("project_id", projectId),
    supabase.from("boq_categories").select("*"),
    supabase.from("boq_subcategories").select("*"),
    supabase.from("boq_items").select("*"),
  ]);

  if (disciplinesError || categoriesError || subcategoriesError || itemsError) {
    throw new Error(
      `BOQ item lookup failed: ${
        disciplinesError?.message ??
        categoriesError?.message ??
        subcategoriesError?.message ??
        itemsError?.message
      }`
    );
  }

  const disciplineMap = new Map<string, DisciplineRow>();
  for (const discipline of disciplines ?? []) {
    disciplineMap.set(discipline.id, discipline);
  }

  const categoryMap = new Map<string, CategoryRow>();
  for (const category of categories ?? []) {
    if (disciplineMap.has(category.discipline_id)) {
      categoryMap.set(category.id, category);
    }
  }

  const subcategoryMap = new Map<string, SubcategoryRow>();
  for (const subcategory of subcategories ?? []) {
    if (categoryMap.has(subcategory.category_id)) {
      subcategoryMap.set(subcategory.id, subcategory);
    }
  }

  return (items ?? [])
    .filter((item) => subcategoryMap.has(item.subcategory_id))
    .map<BOQItemContext>((item) => {
      const subcategory = subcategoryMap.get(item.subcategory_id)!;
      const category = categoryMap.get(subcategory.category_id)!;
      const discipline = disciplineMap.get(category.discipline_id)!;

      return {
        ...item,
        discipline_name: discipline.name,
        category_name: category.name,
        subcategory_name: subcategory.name,
      };
    });
}

function selectBestCandidate(
  boqItem: BOQItemContext,
  records: PriceRecordRow[],
  priceType: "malzeme" | "iscilik",
  preferredCity: string | null
) {
  const ranked = records
    .filter((record) => record.price_type === priceType)
    .map((record) => {
      const match = scorePriceMatch({
        boqItem,
        priceRecord: record,
        preferredCity,
      });

      return {
        ...record,
        ...match,
      };
    })
    .sort((left, right) => right.score - left.score);

  return ranked[0] ?? null;
}

export async function suggestPrices(supabase: DbClient, projectId: string) {
  const [boqItems, projectCity, priceResult] = await Promise.all([
    getProjectBOQItems(supabase, projectId),
    inferProjectCity(supabase, projectId),
    searchPrices(supabase, {}),
  ]);

  return boqItems.map<SuggestedPriceItem>((item) => {
    const materialMatch = selectBestCandidate(
      item,
      priceResult.prices,
      "malzeme",
      projectCity
    );
    const laborMatch = selectBestCandidate(
      item,
      priceResult.prices,
      "iscilik",
      projectCity
    );
    const warnings: string[] = [];

    if (materialMatch?.stale || laborMatch?.stale) {
      warnings.push("6 aydan eski fiyat kaydi var");
    }

    if (!materialMatch && !laborMatch) {
      warnings.push("Eslesen fiyat bulunamadi");
    }

    return {
      boqItemId: item.id,
      pozNo: item.poz_no,
      itemName: item.is_tanimi,
      birim: item.birim,
      discipline: item.discipline_name,
      city: projectCity,
      suggestedMalzemeBf: materialMatch?.unit_price ?? null,
      suggestedIscilikBf: laborMatch?.unit_price ?? null,
      materialMatch,
      laborMatch,
      warnings,
    };
  });
}

function parsePriceWorkbook(bytes: Uint8Array) {
  const workbook = XLSX.read(bytes, { type: "array", dense: true });
  const firstSheet = workbook.SheetNames[0];

  if (!firstSheet) {
    return [];
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    workbook.Sheets[firstSheet],
    {
      defval: "",
      raw: false,
    }
  ) as Record<string, unknown>[];

  return rows
    .map<PriceListRow | null>((row) => {
      const itemName = toOptionalString(pickField(row, "itemName"));
      const priceTypeRaw = normalizeText(toOptionalString(pickField(row, "priceType")));
      const unitPrice = toNumber(pickField(row, "unitPrice"));

      if (!itemName || unitPrice === null) {
        return null;
      }

      const priceType =
        priceTypeRaw === "iscilik" || priceTypeRaw === "işçilik"
          ? "iscilik"
          : "malzeme";

      return {
        itemName,
        itemCategory: toOptionalString(pickField(row, "itemCategory")),
        discipline: toOptionalString(pickField(row, "discipline")),
        priceType,
        unit: toOptionalString(pickField(row, "unit")),
        unitPrice,
        currency: toOptionalString(pickField(row, "currency")) ?? "TRY",
        city: toOptionalString(pickField(row, "city")),
        supplierName: toOptionalString(pickField(row, "supplierName")),
        sourceDate: toOptionalString(pickField(row, "sourceDate")),
      };
    })
    .filter((row): row is PriceListRow => row !== null);
}

function parsePricePdfText(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map<PriceListRow | null>((line) => {
      const parts = line.split(/\s{2,}|\t+/).map((part) => part.trim()).filter(Boolean);

      if (parts.length < 2) {
        return null;
      }

      const unitPrice = toNumber(parts.at(-1));
      if (unitPrice === null) {
        return null;
      }

      return {
        itemName: parts[0],
        itemCategory: null,
        discipline: null,
        priceType: "malzeme",
        unit: parts.length >= 3 ? parts[1] : null,
        unitPrice,
        currency: "TRY",
        city: null,
        supplierName: null,
        sourceDate: null,
      };
    })
    .filter((row): row is PriceListRow => row !== null);
}

async function readFileBytes(file: File) {
  return new Uint8Array(await file.arrayBuffer());
}

export async function importPriceList(
  supabase: DbClient,
  file: File,
  tenantId: string
): Promise<PriceListImportResult> {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const bytes = await readFileBytes(file);
  const rows = isPdf
    ? parsePricePdfText((await extractText(bytes, "application/pdf")).text)
    : parsePriceWorkbook(bytes);
  const warnings: string[] = [];

  const { data: priceList, error: priceListError } = await supabase
    .from("price_lists")
    .insert({
      tenant_id: tenantId,
      supplier_name: null,
      list_date: null,
      source_type: isPdf ? "pdf" : "excel",
      currency: "TRY",
      status: "active",
    })
    .select("*")
    .single();

  if (priceListError || !priceList) {
    throw new Error(
      `Price list creation failed: ${priceListError?.message ?? "unknown"}`
    );
  }

  if (rows.length === 0) {
    warnings.push("Dosyadan fiyat satiri cikartilamadi");
    return {
      success: true,
      priceListId: priceList.id,
      importedCount: 0,
      warnings,
    };
  }

  const inserts = rows.map((row) => ({
    tenant_id: tenantId,
    item_name: row.itemName,
    item_category: row.itemCategory,
    discipline: row.discipline,
    price_type: row.priceType,
    unit: row.unit,
    unit_price: row.unitPrice,
    currency: row.currency,
    source_type: "supplier_list" as const,
    source_name: file.name,
    source_date: row.sourceDate,
    city: row.city,
    supplier_name: row.supplierName,
  }));

  const { error: insertError } = await supabase.from("price_records").insert(inserts);

  if (insertError) {
    throw new Error(`Price record import failed: ${insertError.message}`);
  }

  return {
    success: true,
    priceListId: priceList.id,
    importedCount: inserts.length,
    warnings,
  };
}
