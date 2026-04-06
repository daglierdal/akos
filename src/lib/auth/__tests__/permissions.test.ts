import { describe, expect, it } from "vitest";
import {
  canCreateProposal,
  canCreateProject,
  canDeleteProject,
  canEditBOQ,
  canImportBOQ,
  canImportPriceList,
  canSubmitProposal,
  canUploadDocument,
  canViewAllProjects,
} from "@/lib/auth/permissions";

describe("permissions", () => {
  it("grants all basic project permissions to admin-like roles", () => {
    expect(canCreateProject("admin")).toBe(true);
    expect(canCreateProject("owner")).toBe(true);
    expect(canCreateProposal("admin")).toBe(true);
    expect(canSubmitProposal("admin")).toBe(true);
    expect(canImportBOQ("admin")).toBe(true);
    expect(canImportPriceList("admin")).toBe(true);
    expect(canUploadDocument("admin")).toBe(true);
    expect(canEditBOQ("admin")).toBe(true);
    expect(canDeleteProject("owner")).toBe(true);
    expect(canViewAllProjects("admin")).toBe(true);
  });

  it("allows tenant project writers for non-admin mutate actions", () => {
    expect(canCreateProposal("user")).toBe(true);
    expect(canImportBOQ("user")).toBe(true);
    expect(canUploadDocument("user")).toBe(true);
    expect(canEditBOQ("user")).toBe(true);
  });

  it("restricts standard users from admin-only actions", () => {
    expect(canCreateProject("user")).toBe(false);
    expect(canSubmitProposal("user")).toBe(false);
    expect(canImportPriceList("user")).toBe(false);
    expect(canDeleteProject("user")).toBe(false);
    expect(canViewAllProjects("user")).toBe(false);
  });
});
