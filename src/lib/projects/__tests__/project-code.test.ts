import { describe, expect, it } from "vitest";
import {
  formatProjectSequence,
  generateProjectCode,
} from "@/lib/projects/project-code";

describe("project-code", () => {
  it("formats project codes with prefix, year and zero-padded sequence", () => {
    expect(
      generateProjectCode({
        prefix: "akr",
        year: 2026,
        sequence: 12,
      }),
    ).toBe("AKR-2026-0012");
  });

  it("falls back to a default prefix", () => {
    expect(
      generateProjectCode({
        prefix: "",
        year: 2026,
        sequence: 1,
      }),
    ).toBe("PRJ-2026-0001");
  });

  it("pads sequence values consistently", () => {
    expect(formatProjectSequence(7)).toBe("0007");
  });
});
