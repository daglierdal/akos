import { describe, expect, it } from "vitest";
import {
  canCreateProject,
  canDeleteProject,
  canSubmitProposal,
  canViewAllProjects,
} from "@/lib/auth/permissions";

describe("permissions", () => {
  it("grants all basic project permissions to admin-like roles", () => {
    expect(canCreateProject("admin")).toBe(true);
    expect(canCreateProject("owner")).toBe(true);
    expect(canSubmitProposal("admin")).toBe(true);
    expect(canDeleteProject("owner")).toBe(true);
    expect(canViewAllProjects("admin")).toBe(true);
  });

  it("restricts standard users", () => {
    expect(canCreateProject("user")).toBe(false);
    expect(canSubmitProposal("member")).toBe(false);
    expect(canDeleteProject("user")).toBe(false);
    expect(canViewAllProjects("user")).toBe(false);
  });
});
