import { describe, expect, it } from "vitest";
import {
  parseBOQWorkbook,
  validateBOQRows,
} from "../import-service";
import * as XLSX from "xlsx";

function createWorkbook(rows: Array<Record<string, unknown>>) {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, "BOQ");
  return new Uint8Array(
    XLSX.write(workbook, {
      type: "array",
      bookType: "xlsx",
    })
  );
}

describe("validateBOQRows", () => {
  it("marks empty quantity and duplicate poz_no as error", () => {
    const rows = parseBOQWorkbook(
      "boq.xlsx",
      createWorkbook([
        {
          "Poz No": "01.001",
          "Is Tanimi": "Betonarme",
          Birim: "m3",
          Miktar: "",
        },
        {
          "Poz No": "01.001",
          "Is Tanimi": "Betonarme",
          Birim: "m3",
          Miktar: 10,
        },
      ])
    );

    const result = validateBOQRows(rows);

    expect(result[0].validation.status).toBe("error");
    expect(result[0].validation.messages).toContain("Bos veya gecersiz miktar");
    expect(result[1].validation.status).toBe("error");
    expect(result[1].validation.messages).toContain("Tekrar eden poz_no");
  });

  it("marks unit inconsistency as warning when poz_no is unique", () => {
    const rows = parseBOQWorkbook(
      "boq.xlsx",
      createWorkbook([
        {
          "Poz No": "02.001",
          "Is Tanimi": "Kablo Tavasi",
          Birim: "m",
          Miktar: 12,
        },
        {
          "Poz No": "02.002",
          "Is Tanimi": "Kablo Tavasi",
          Birim: "adet",
          Miktar: 12,
        },
      ])
    );

    const result = validateBOQRows(rows);

    expect(result[1].validation.status).toBe("warning");
    expect(result[1].validation.messages).toContain("Birim tutarsizligi");
  });
});
