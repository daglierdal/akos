import { describe, expect, it } from "vitest";
import { resolveDriveRouting } from "../routing-rules";

describe("resolveDriveRouting", () => {
  it("routes DWG files to AutoCAD", () => {
    expect(
      resolveDriveRouting({
        category: "drawing",
        extension: "dwg",
        fileName: "plan.dwg",
      }).path
    ).toBe("10_Drawings/AutoCAD");
  });

  it("routes drawing PDFs to PDF_Set", () => {
    expect(
      resolveDriveRouting({
        category: "drawing",
        extension: "pdf",
        fileName: "layout.pdf",
        isDrawingPdf: true,
      }).path
    ).toBe("10_Drawings/PDF_Set");
  });

  it("routes BOQ spreadsheets to revision working folder", () => {
    expect(
      resolveDriveRouting({
        category: "boq",
        extension: "xlsx",
        fileName: "boq.xlsx",
        revisionLabel: "REV-03",
      }).path
    ).toBe("01_Proposal/REV-03/02_BOQ_Working");
  });

  it("routes site photos to site photo folder", () => {
    expect(
      resolveDriveRouting({
        category: "photo",
        extension: "jpg",
        fileName: "site-progress.jpg",
        isSitePhoto: true,
      }).path
    ).toBe("40_Site_Photos");
  });

  it("falls back to client documents", () => {
    expect(
      resolveDriveRouting({
        category: "other",
        extension: "zip",
        fileName: "client-package.zip",
      }).path
    ).toBe("30_Client_Documents");
  });
});
