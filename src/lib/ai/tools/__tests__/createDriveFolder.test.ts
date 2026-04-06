import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDriveFolder } from "../createDriveFolder";
import type { ToolContext } from "../index";
import { createFolder, getDriveClient } from "@/lib/drive/client";

vi.mock("@/lib/drive/client", () => ({
  createFolder: vi.fn(),
  getDriveClient: vi.fn(),
}));

function createMockContext() {
  let insertedRows: unknown[] = [];

  const context = {
    tenantId: "tenant-1",
    userId: "user-1",
    supabase: {
      from(table: string) {
        if (table !== "drive_files") {
          throw new Error(`Unexpected table: ${table}`);
        }

        return {
          insert(payload: unknown[]) {
            insertedRows = payload;
            return Promise.resolve({ error: null });
          },
        };
      },
    },
  };

  return {
    context: context as unknown as ToolContext,
    getInsertedRows() {
      return insertedRows;
    },
  };
}

describe("createDriveFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have correct tool metadata", () => {
    expect(createDriveFolder.name).toBe("createDriveFolder");
    expect(createDriveFolder.description).toBeTruthy();
  });

  it("should create the full Drive folder structure and persist it", async () => {
    vi.mocked(getDriveClient).mockResolvedValue({} as never);

    let sequence = 0;
    vi.mocked(createFolder).mockImplementation(async (_drive, name, parentId) => {
      sequence += 1;

      return {
        id: `folder-${sequence}`,
        name,
        mimeType: "application/vnd.google-apps.folder",
        parents: parentId ? [parentId] : undefined,
        webViewLink: `https://drive.google.com/${sequence}`,
      };
    });

    const { context, getInsertedRows } = createMockContext();

    const result = await createDriveFolder.execute(
      {
        projectCode: "PRJ-001",
        projectName: "Merkez Ofis",
      },
      context
    );

    expect(result.success).toBe(true);
    expect(result.rootFolder.name).toBe("PRJ-001_Merkez Ofis");
    expect(result.createdFolderCount).toBe(25);
    expect(vi.mocked(createFolder)).toHaveBeenCalledTimes(25);

    const rows = getInsertedRows() as Array<{
      project_id: string | null;
      file_role: string | null;
      document_type: string | null;
      discipline: string | null;
      revision_label: string | null;
      drive_file_id: string;
    }>;

    expect(rows).toHaveLength(25);
    expect(rows[0]).toMatchObject({
      project_id: null,
      file_role: "folder",
      document_type: "project_root",
      discipline: null,
      revision_label: "PRJ-001_Merkez Ofis",
    });
    expect(
      rows.some((row) => row.revision_label?.endsWith("/01_Proposal/REV-00/06_Submitted"))
    ).toBe(
      true
    );
    expect(rows.some((row) => row.revision_label?.endsWith("/20_Models/IFC_RVT"))).toBe(true);
    expect(rows[0].drive_file_id).toBe("folder-1");
  });

  it("should validate required parameters", () => {
    expect(
      createDriveFolder.parameters.safeParse({
        projectCode: "PRJ-001",
        projectName: "Merkez Ofis",
      }).success
    ).toBe(true);

    expect(
      createDriveFolder.parameters.safeParse({
        projectCode: "",
        projectName: "Merkez Ofis",
      }).success
    ).toBe(false);
  });
});
