import { beforeEach, describe, expect, it, vi } from "vitest";
import * as XLSX from "xlsx";
import { extractText } from "../text-extractor";

const { mockExtractPdfText, mockGetPdfMeta } = vi.hoisted(() => ({
  mockExtractPdfText: vi.fn(),
  mockGetPdfMeta: vi.fn(),
}));

vi.mock("unpdf", () => ({
  extractText: mockExtractPdfText,
  getMeta: mockGetPdfMeta,
}));

describe("extractText", () => {
  beforeEach(() => {
    mockExtractPdfText.mockReset();
    mockGetPdfMeta.mockReset();
  });

  it("extracts text from PDF buffers with unpdf", async () => {
    mockExtractPdfText.mockResolvedValue({
      text: "Sayfa 1\nSayfa 2",
      totalPages: 2,
    });
    mockGetPdfMeta.mockResolvedValue({
      info: { Title: "Teklif" },
      metadata: { Author: "AkOs" },
    });

    const result = await extractText(
      Buffer.from("pdf-binary"),
      "application/pdf"
    );

    expect(mockExtractPdfText).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      text: "Sayfa 1\nSayfa 2",
      pageCount: 2,
      metadata: {
        info: { Title: "Teklif" },
        metadata: { Author: "AkOs" },
      },
    });
  });

  it("extracts text from XLSX buffers with SheetJS", async () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Poz No", "Aciklama", "Tutar"],
      ["A-01", "Beton", 1500],
      ["A-02", "Demir", 2300],
    ]);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Kesif");

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    }) as Buffer;

    const result = await extractText(
      buffer,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    expect(result.pageCount).toBe(1);
    expect(result.metadata).toEqual({
      sheetNames: ["Kesif"],
    });
    expect(result.text).toContain("Kesif");
    expect(result.text).toContain("Poz No\tAciklama\tTutar");
    expect(result.text).toContain("A-01\tBeton\t1500");
    expect(result.text).toContain("A-02\tDemir\t2300");
  });
});
