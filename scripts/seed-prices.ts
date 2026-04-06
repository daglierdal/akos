import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { importPriceList } from "@/lib/boq/price-service";
import type { Database } from "@/lib/supabase/database.types";

function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

async function main() {
  const supabase = createClient<Database>(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
  const tenantId = getEnv("SEED_TENANT_ID");
  const seedDir = join(process.env.HOME ?? "", "gt", "akos", "seed-data");
  const entries = await readdir(seedDir, { withFileTypes: true });
  const excelFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".xlsx"))
    .map((entry) => join(seedDir, entry.name));

  for (const filePath of excelFiles) {
    const fileName = filePath.split("/").at(-1) ?? "seed.xlsx";
    const bytes = await readFile(filePath);
    const imported = await importPriceList(
      supabase,
      new File([bytes], fileName, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      tenantId
    );

    console.log(`${fileName}: ${imported.importedCount} kayit`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
