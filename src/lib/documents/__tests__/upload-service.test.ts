import { describe, expect, it } from "vitest";
import {
  decideUploadTarget,
  detectDocumentCategory,
} from "../upload-service";

describe("detectDocumentCategory", () => {
  it("classifies DWG as drawing", async () => {
    const file = new File(["dummy"], "plan.dwg", {
      type: "application/acad",
    });

    await expect(detectDocumentCategory(file)).resolves.toMatchObject({
      category: "drawing",
      confidence: "high",
    });
  });

  it("classifies sketchup file as model", async () => {
    const file = new File(["dummy"], "villa-model.skp", {
      type: "application/octet-stream",
    });

    await expect(detectDocumentCategory(file)).resolves.toMatchObject({
      category: "model",
      confidence: "high",
    });
  });

  it("detects drawing-style pdf from content hints", async () => {
    const file = new File(["shop drawing elevation layout"], "set.pdf", {
      type: "application/pdf",
    });

    await expect(detectDocumentCategory(file)).resolves.toMatchObject({
      category: "drawing",
      isDrawingPdf: true,
    });
  });

  it("detects boq spreadsheet from column hints", async () => {
    const file = new File(["Qty Unit Price Amount BOQ"], "offer.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    await expect(detectDocumentCategory(file)).resolves.toMatchObject({
      category: "boq",
      confidence: "high",
    });
  });

  it("classifies images as photo", async () => {
    const file = new File(["binary"], "saha-photo.png", {
      type: "image/png",
    });

    await expect(detectDocumentCategory(file)).resolves.toMatchObject({
      category: "photo",
      isSitePhoto: true,
    });
  });
});

describe("decideUploadTarget", () => {
  it("uses supabase for ai-readable files under 50MB", () => {
    expect(
      decideUploadTarget({
        name: "report.pdf",
        size: 10 * 1024 * 1024,
      })
    ).toEqual({
      kind: "supabase",
      reason: "ai-readable",
    });
  });

  it("uses drive for large files", () => {
    expect(
      decideUploadTarget({
        name: "report.pdf",
        size: 55 * 1024 * 1024,
      })
    ).toEqual({
      kind: "drive",
      reason: "size",
    });
  });

  it("uses drive for non ai-readable files", () => {
    expect(
      decideUploadTarget({
        name: "model.skp",
        size: 5 * 1024 * 1024,
      })
    ).toEqual({
      kind: "drive",
      reason: "non-ai-readable",
    });
  });
});
