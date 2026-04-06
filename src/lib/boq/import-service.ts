import * as XLSX from "xlsx";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/database.types";
import {
  createCategory,
  createDiscipline,
  createItem,
  createSubcategory,
} from "./boq-service";

type DbClient = Pick<SupabaseClient<Database>, "from">;
type ImportJobRow = Database["public"]["Tables"]["import_jobs"]["Row"];
type ImportRowRow = Database["public"]["Tables"]["boq_import_rows"]["Row"];
type ImportValidationStatus = "valid" | "warning" | "error";

export interface ParsedBOQRow {
  rowNumber: number;
  discipline: string;
  category: string;
  subcategory: string;
  pozNo: string;
  isTanimi: string;
  aciklama: string | null;
  birim: string;
  miktar: number | null;
  malzemeBf: number | null;
  iscilikBf: number | null;
  tedarikTipi: string | null;
  projeMarka: string | null;
  yukleniciMarka: string | null;
  urunKodu: string | null;
  rowData: Record<string, Json>;
}

export interface RowValidationResult {
  status: ImportValidationStatus;
  messages: string[];
}

export interface ValidatedBOQImportRow extends ParsedBOQRow {
  validation: RowValidationResult;
}

export interface ImportBOQResult {
  success: boolean;
  jobId: string;
  rowCount: number;
  importedCount: number;
  errorCount: number;
  warningCount: number;
}

export interface ImportStatusResult {
  job: ImportJobRow;
  summary: {
    valid: number;
    warning: number;
    error: number;
    imported: number;
  };
  rows: ImportRowRow[];
}

const HEADER_ALIASES: Record<string, string[]> = {
  discipline: ["discipline", "disiplin", "poz grubu", "grup", "bolum"],
  category: ["category", "kategori", "mahal", "fasil"],
  subcategory: ["subcategory", "alt kategori", "alt grup", "imalat grubu"],
  pozNo: ["poz no", "poz_no", "poz", "item no", "kod"],
  isTanimi: ["is tanimi", "iş tanımı", "tanim", "açıklama", "aciklama", "kalem"],
  aciklama: ["detay aciklama", "açıklama 2", "note", "not"],
  birim: ["birim", "unit"],
  miktar: ["miktar", "qty", "quantity", "metraj"],
  malzemeBf: ["malzeme bf", "malzeme birim fiyat", "malzeme fiyat", "material"],
  iscilikBf: ["iscilik bf", "işçilik bf", "iscilik birim fiyat", "labor"],
  tedarikTipi: ["tedarik tipi", "tip", "price_type"],
  projeMarka: ["proje marka", "marka"],
  yukleniciMarka: ["yuklenici marka", "yüklenici marka"],
  urunKodu: ["urun kodu", "ürün kodu", "stok kodu"],
};

function normalizeHeader(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ")
    .replace(/[_-]+/g, " ")
    .trim();
}

function toOptionalString(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

function toRequiredString(value: unknown, fallback: string) {
  const normalized = toOptionalString(value);
  return normalized ?? fallback;
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

function getValue(row: Record<string, unknown>, field: keyof typeof HEADER_ALIASES) {
  const entries = Object.entries(row);

  for (const [key, value] of entries) {
    if (HEADER_ALIASES[field].includes(normalizeHeader(key))) {
      return value;
    }
  }

  return null;
}

export function parseBOQWorkbook(fileName: string, bytes: Uint8Array) {
  const workbook = XLSX.read(bytes, { type: "array", dense: true });
  const firstSheet = workbook.SheetNames[0];

  if (!firstSheet) {
    throw new Error(`No worksheet found in ${fileName}`);
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    workbook.Sheets[firstSheet],
    {
      defval: "",
      raw: false,
    }
  ) as Record<string, unknown>[];

  return rows.map<ParsedBOQRow>((row, index) => ({
    rowNumber: index + 2,
    discipline: toRequiredString(getValue(row, "discipline"), "Genel"),
    category: toRequiredString(getValue(row, "category"), "Genel"),
    subcategory: toRequiredString(getValue(row, "subcategory"), "Genel"),
    pozNo: toRequiredString(getValue(row, "pozNo"), `ROW-${index + 1}`),
    isTanimi: toRequiredString(getValue(row, "isTanimi"), "Tanimsiz kalem"),
    aciklama: toOptionalString(getValue(row, "aciklama")),
    birim: toRequiredString(getValue(row, "birim"), "adet"),
    miktar: toNumber(getValue(row, "miktar")),
    malzemeBf: toNumber(getValue(row, "malzemeBf")),
    iscilikBf: toNumber(getValue(row, "iscilikBf")),
    tedarikTipi: toOptionalString(getValue(row, "tedarikTipi")),
    projeMarka: toOptionalString(getValue(row, "projeMarka")),
    yukleniciMarka: toOptionalString(getValue(row, "yukleniciMarka")),
    urunKodu: toOptionalString(getValue(row, "urunKodu")),
    rowData: Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, serializeJsonValue(value)])
    ),
  }));
}

function serializeJsonValue(value: unknown): Json {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  return String(value ?? "");
}

export function validateBOQRows(rows: ParsedBOQRow[]): ValidatedBOQImportRow[] {
  const birimByPozNo = new Map<string, string>();
  const pozNoCounts = new Map<string, number>();
  const birimByTanim = new Map<string, string>();

  for (const row of rows) {
    if (row.pozNo) {
      pozNoCounts.set(row.pozNo, (pozNoCounts.get(row.pozNo) ?? 0) + 1);
      if (!birimByPozNo.has(row.pozNo)) {
        birimByPozNo.set(row.pozNo, row.birim);
      }
    }

    const tanimKey = normalizeHeader(row.isTanimi);
    if (tanimKey && !birimByTanim.has(tanimKey)) {
      birimByTanim.set(tanimKey, row.birim);
    }
  }

  return rows.map((row) => {
    const messages: string[] = [];
    let status: ImportValidationStatus = "valid";

    if (row.miktar === null || row.miktar <= 0) {
      status = "error";
      messages.push("Bos veya gecersiz miktar");
    }

    if ((pozNoCounts.get(row.pozNo) ?? 0) > 1) {
      status = "error";
      messages.push("Tekrar eden poz_no");
    }

    const pozReferenceUnit = birimByPozNo.get(row.pozNo);
    const tanimReferenceUnit = birimByTanim.get(normalizeHeader(row.isTanimi));
    const hasUnitMismatch =
      (pozReferenceUnit !== undefined && pozReferenceUnit !== row.birim) ||
      (tanimReferenceUnit !== undefined && tanimReferenceUnit !== row.birim);

    if (hasUnitMismatch && status !== "error") {
      status = "warning";
      messages.push("Birim tutarsizligi");
    }

    return {
      ...row,
      validation: {
        status,
        messages,
      },
    };
  });
}

async function ensureDiscipline(
  supabase: DbClient,
  tenantId: string,
  projectId: string,
  cache: Map<string, string>,
  name: string
) {
  const key = `${projectId}:${name}`;
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const { data, error } = await supabase
    .from("boq_disciplines")
    .select("id")
    .eq("project_id", projectId)
    .eq("name", name)
    .limit(1);

  if (error) {
    throw new Error(`Discipline lookup failed: ${error.message}`);
  }

  const existingId = data?.[0]?.id;
  if (existingId) {
    cache.set(key, existingId);
    return existingId;
  }

  const created = await createDiscipline(supabase, {
    tenant_id: tenantId,
    project_id: projectId,
    name,
  });
  if (!created) {
    throw new Error("Discipline creation returned no row");
  }

  cache.set(key, created.id);
  return created.id;
}

async function ensureCategory(
  supabase: DbClient,
  tenantId: string,
  cache: Map<string, string>,
  disciplineId: string,
  name: string
) {
  const key = `${disciplineId}:${name}`;
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const { data, error } = await supabase
    .from("boq_categories")
    .select("id")
    .eq("discipline_id", disciplineId)
    .eq("name", name)
    .limit(1);

  if (error) {
    throw new Error(`Category lookup failed: ${error.message}`);
  }

  const existingId = data?.[0]?.id;
  if (existingId) {
    cache.set(key, existingId);
    return existingId;
  }

  const created = await createCategory(supabase, {
    tenant_id: tenantId,
    discipline_id: disciplineId,
    name,
  });
  if (!created) {
    throw new Error("Category creation returned no row");
  }

  cache.set(key, created.id);
  return created.id;
}

async function ensureSubcategory(
  supabase: DbClient,
  tenantId: string,
  cache: Map<string, string>,
  categoryId: string,
  name: string
) {
  const key = `${categoryId}:${name}`;
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const { data, error } = await supabase
    .from("boq_subcategories")
    .select("id")
    .eq("category_id", categoryId)
    .eq("name", name)
    .limit(1);

  if (error) {
    throw new Error(`Subcategory lookup failed: ${error.message}`);
  }

  const existingId = data?.[0]?.id;
  if (existingId) {
    cache.set(key, existingId);
    return existingId;
  }

  const created = await createSubcategory(supabase, {
    tenant_id: tenantId,
    category_id: categoryId,
    name,
  });
  if (!created) {
    throw new Error("Subcategory creation returned no row");
  }

  cache.set(key, created.id);
  return created.id;
}

async function readFileBytes(file: File) {
  return new Uint8Array(await file.arrayBuffer());
}

export async function importBOQFromExcel(
  supabase: DbClient,
  file: File,
  projectId: string,
  tenantId: string
): Promise<ImportBOQResult> {
  const { data: job, error: jobError } = await supabase
    .from("import_jobs")
    .insert({
      tenant_id: tenantId,
      project_id: projectId,
      file_name: file.name,
      status: "processing",
    })
    .select("*")
    .single();

  if (jobError || !job) {
    throw new Error(`Import job creation failed: ${jobError?.message ?? "unknown"}`);
  }

  try {
    const parsedRows = parseBOQWorkbook(file.name, await readFileBytes(file));
    const validatedRows = validateBOQRows(parsedRows);

    const stagedRows = validatedRows.map((row) => ({
      tenant_id: tenantId,
      import_job_id: job.id,
      row_data: row.rowData,
      validation_status: row.validation.status,
      validation_message: row.validation.messages.join("; ") || null,
    }));

    const { data: insertedRows, error: rowInsertError } = await supabase
      .from("boq_import_rows")
      .insert(stagedRows)
      .select("*");

    if (rowInsertError) {
      throw new Error(`Import staging failed: ${rowInsertError.message}`);
    }

    const disciplineCache = new Map<string, string>();
    const categoryCache = new Map<string, string>();
    const subcategoryCache = new Map<string, string>();
    let importedCount = 0;

    for (let index = 0; index < validatedRows.length; index += 1) {
      const row = validatedRows[index];
      if (row.validation.status === "error") {
        continue;
      }

      const disciplineId = await ensureDiscipline(
        supabase,
        tenantId,
        projectId,
        disciplineCache,
        row.discipline
      );
      const categoryId = await ensureCategory(
        supabase,
        tenantId,
        categoryCache,
        disciplineId,
        row.category
      );
      const subcategoryId = await ensureSubcategory(
        supabase,
        tenantId,
        subcategoryCache,
        categoryId,
        row.subcategory
      );
      const createdItem = await createItem(supabase, {
        tenant_id: tenantId,
        subcategory_id: subcategoryId,
        poz_no: row.pozNo,
        is_tanimi: row.isTanimi,
        aciklama: row.aciklama,
        birim: row.birim,
        miktar: row.miktar,
        malzeme_bf: row.malzemeBf,
        iscilik_bf: row.iscilikBf,
        tedarik_tipi: row.tedarikTipi,
        proje_marka: row.projeMarka,
        yuklenici_marka: row.yukleniciMarka,
        urun_kodu: row.urunKodu,
      });
      if (!createdItem) {
        throw new Error("BOQ item creation returned no row");
      }

      importedCount += 1;

      const staged = insertedRows?.[index];
      if (staged) {
        const { error: updateError } = await supabase
          .from("boq_import_rows")
          .update({
            mapped_boq_item_id: createdItem.id,
          })
          .eq("id", staged.id);

        if (updateError) {
          throw new Error(`Import row mapping failed: ${updateError.message}`);
        }
      }
    }

    const errorCount = validatedRows.filter(
      (row) => row.validation.status === "error"
    ).length;
    const warningCount = validatedRows.filter(
      (row) => row.validation.status === "warning"
    ).length;

    const { error: jobUpdateError } = await supabase
      .from("import_jobs")
      .update({
        status: "done",
        row_count: validatedRows.length,
        error_count: errorCount,
      })
      .eq("id", job.id);

    if (jobUpdateError) {
      throw new Error(`Import job update failed: ${jobUpdateError.message}`);
    }

    return {
      success: true,
      jobId: job.id,
      rowCount: validatedRows.length,
      importedCount,
      errorCount,
      warningCount,
    };
  } catch (error) {
    await supabase
      .from("import_jobs")
      .update({
        status: "failed",
      })
      .eq("id", job.id);

    throw error;
  }
}

export async function getImportStatus(
  supabase: DbClient,
  jobId: string
): Promise<ImportStatusResult> {
  const [{ data: job, error: jobError }, { data: rows, error: rowsError }] =
    await Promise.all([
      supabase.from("import_jobs").select("*").eq("id", jobId).single(),
      supabase
        .from("boq_import_rows")
        .select("*")
        .eq("import_job_id", jobId)
        .order("created_at", { ascending: true }),
    ]);

  if (jobError || !job) {
    throw new Error(`Import job fetch failed: ${jobError?.message ?? "unknown"}`);
  }

  if (rowsError) {
    throw new Error(`Import rows fetch failed: ${rowsError.message}`);
  }

  const importRows = rows ?? [];

  return {
    job,
    summary: {
      valid: importRows.filter((row) => row.validation_status === "valid").length,
      warning: importRows.filter((row) => row.validation_status === "warning").length,
      error: importRows.filter((row) => row.validation_status === "error").length,
      imported: importRows.filter((row) => row.mapped_boq_item_id !== null).length,
    },
    rows: importRows,
  };
}
