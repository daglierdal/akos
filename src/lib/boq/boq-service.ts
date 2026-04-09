import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type DbClient = Pick<SupabaseClient<Database>, "from">;
type DisciplineRow = Database["public"]["Tables"]["boq_disciplines"]["Row"];
type DisciplineInsert = Database["public"]["Tables"]["boq_disciplines"]["Insert"];
type DisciplineUpdate = Database["public"]["Tables"]["boq_disciplines"]["Update"];
type CategoryRow = Database["public"]["Tables"]["boq_categories"]["Row"];
type CategoryInsert = Database["public"]["Tables"]["boq_categories"]["Insert"];
type CategoryUpdate = Database["public"]["Tables"]["boq_categories"]["Update"];
type SubcategoryRow = Database["public"]["Tables"]["boq_subcategories"]["Row"];
type SubcategoryInsert = Database["public"]["Tables"]["boq_subcategories"]["Insert"];
type SubcategoryUpdate = Database["public"]["Tables"]["boq_subcategories"]["Update"];
type ItemRow = Database["public"]["Tables"]["boq_items"]["Row"];
type ItemInsert = Database["public"]["Tables"]["boq_items"]["Insert"];
type ItemUpdate = Database["public"]["Tables"]["boq_items"]["Update"];

export type BOQTreeItem = ItemRow;

export interface BOQTreeSubcategory extends SubcategoryRow {
  items: BOQTreeItem[];
}

export interface BOQTreeCategory extends CategoryRow {
  subcategories: BOQTreeSubcategory[];
}

export interface BOQTreeDiscipline extends DisciplineRow {
  categories: BOQTreeCategory[];
}

function withMessage(prefix: string, error: { message: string } | null) {
  if (!error) {
    return;
  }

  throw new Error(`${prefix}: ${error.message}`);
}

function sortByOrderThenCreatedAt<
  T extends { sort_order: number | null; created_at: string }
>(rows: T[]): T[] {
  return [...rows].sort((left, right) => {
    const leftOrder = left.sort_order ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.sort_order ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.created_at.localeCompare(right.created_at);
  });
}

export async function createDiscipline(
  supabase: DbClient,
  payload: DisciplineInsert
) {
  const { data, error } = await supabase
    .from("boq_disciplines")
    .insert(payload)
    .select("*")
    .single();

  withMessage("Discipline creation failed", error);
  return data;
}

export async function getDiscipline(supabase: DbClient, id: string) {
  const { data, error } = await supabase
    .from("boq_disciplines")
    .select("*")
    .eq("id", id)
    .single();

  withMessage("Discipline fetch failed", error);
  return data;
}

export async function updateDiscipline(
  supabase: DbClient,
  id: string,
  payload: DisciplineUpdate
) {
  const { data, error } = await supabase
    .from("boq_disciplines")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  withMessage("Discipline update failed", error);
  return data;
}

export async function deleteDiscipline(supabase: DbClient, id: string) {
  const { error } = await supabase.from("boq_disciplines").delete().eq("id", id);
  withMessage("Discipline delete failed", error);
}

export async function createCategory(supabase: DbClient, payload: CategoryInsert) {
  const { data, error } = await supabase
    .from("boq_categories")
    .insert(payload)
    .select("*")
    .single();

  withMessage("Category creation failed", error);
  return data;
}

export async function getCategory(supabase: DbClient, id: string) {
  const { data, error } = await supabase
    .from("boq_categories")
    .select("*")
    .eq("id", id)
    .single();

  withMessage("Category fetch failed", error);
  return data;
}

export async function updateCategory(
  supabase: DbClient,
  id: string,
  payload: CategoryUpdate
) {
  const { data, error } = await supabase
    .from("boq_categories")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  withMessage("Category update failed", error);
  return data;
}

export async function deleteCategory(supabase: DbClient, id: string) {
  const { error } = await supabase.from("boq_categories").delete().eq("id", id);
  withMessage("Category delete failed", error);
}

export async function createSubcategory(
  supabase: DbClient,
  payload: SubcategoryInsert
) {
  const { data, error } = await supabase
    .from("boq_subcategories")
    .insert(payload)
    .select("*")
    .single();

  withMessage("Subcategory creation failed", error);
  return data;
}

export async function getSubcategory(supabase: DbClient, id: string) {
  const { data, error } = await supabase
    .from("boq_subcategories")
    .select("*")
    .eq("id", id)
    .single();

  withMessage("Subcategory fetch failed", error);
  return data;
}

export async function updateSubcategory(
  supabase: DbClient,
  id: string,
  payload: SubcategoryUpdate
) {
  const { data, error } = await supabase
    .from("boq_subcategories")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  withMessage("Subcategory update failed", error);
  return data;
}

export async function deleteSubcategory(supabase: DbClient, id: string) {
  const { error } = await supabase.from("boq_subcategories").delete().eq("id", id);
  withMessage("Subcategory delete failed", error);
}

export async function createItem(supabase: DbClient, payload: ItemInsert) {
  const { data, error } = await supabase
    .from("boq_items")
    .insert(payload)
    .select("*")
    .single();

  withMessage("BOQ item creation failed", error);
  return data;
}

export async function getItem(supabase: DbClient, id: string) {
  const { data, error } = await supabase
    .from("boq_items")
    .select("*")
    .eq("id", id)
    .single();

  withMessage("BOQ item fetch failed", error);
  return data;
}

export async function updateItem(
  supabase: DbClient,
  id: string,
  payload: ItemUpdate
) {
  const { data, error } = await supabase
    .from("boq_items")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  withMessage("BOQ item update failed", error);
  return data;
}

export async function deleteItem(supabase: DbClient, id: string) {
  const { error } = await supabase.from("boq_items").delete().eq("id", id);
  withMessage("BOQ item delete failed", error);
}

export async function getBOQTree(supabase: DbClient, projectId: string) {
  const [
    { data: disciplines, error: disciplineError },
    { data: categories, error: categoryError },
    { data: subcategories, error: subcategoryError },
    { data: items, error: itemError },
  ] = await Promise.all([
    supabase
      .from("boq_disciplines")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("boq_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("boq_subcategories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("boq_items")
      .select("*")
      .order("poz_no", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  withMessage(
    "BOQ tree query failed",
    disciplineError ?? categoryError ?? subcategoryError ?? itemError
  );

  const disciplineRows = disciplines ?? [];
  const disciplineIds = new Set(disciplineRows.map((row) => row.id));
  const categoryRows = sortByOrderThenCreatedAt(
    (categories ?? []).filter((row) => disciplineIds.has(row.discipline_id))
  );
  const categoryIds = new Set(categoryRows.map((row) => row.id));
  const subcategoryRows = sortByOrderThenCreatedAt(
    (subcategories ?? []).filter((row) => categoryIds.has(row.category_id))
  );
  const subcategoryIds = new Set(subcategoryRows.map((row) => row.id));
  const itemRows = (items ?? []).filter((row) => subcategoryIds.has(row.subcategory_id));

  const itemsBySubcategory = new Map<string, ItemRow[]>();
  for (const item of itemRows) {
    const current = itemsBySubcategory.get(item.subcategory_id) ?? [];
    current.push(item);
    itemsBySubcategory.set(item.subcategory_id, current);
  }

  const subcategoriesByCategory = new Map<string, BOQTreeSubcategory[]>();
  for (const subcategory of subcategoryRows) {
    const current = subcategoriesByCategory.get(subcategory.category_id) ?? [];
    current.push({
      ...subcategory,
      items: itemsBySubcategory.get(subcategory.id) ?? [],
    });
    subcategoriesByCategory.set(subcategory.category_id, current);
  }

  const categoriesByDiscipline = new Map<string, BOQTreeCategory[]>();
  for (const category of categoryRows) {
    const current = categoriesByDiscipline.get(category.discipline_id) ?? [];
    current.push({
      ...category,
      subcategories: subcategoriesByCategory.get(category.id) ?? [],
    });
    categoriesByDiscipline.set(category.discipline_id, current);
  }

  return disciplineRows.map((discipline) => ({
    ...discipline,
    categories: categoriesByDiscipline.get(discipline.id) ?? [],
  }));
}
