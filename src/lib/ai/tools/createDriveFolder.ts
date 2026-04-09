import { z } from "zod";
import type { drive_v3 } from "@/lib/drive/client";
import { createFolder, getDriveClient } from "@/lib/drive/client";
import type { Database } from "@/lib/supabase/database.types";
import type { ToolContext, ToolDefinition } from "./index";

const GOOGLE_DRIVE_FOLDER_MIME = "application/vnd.google-apps.folder";

const parameters = z.object({
  projectCode: z.string().min(1).describe("Proje kodu"),
  projectName: z.string().min(1).describe("Proje adi"),
  projectId: z.string().uuid().optional().describe("Opsiyonel proje ID"),
  customerName: z.string().optional().describe("Musteri adi"),
});

type FolderNode = {
  name: string;
  children?: FolderNode[];
};

const folderTree: FolderNode[] = [
  {
    name: "00_Project_Start",
    children: [
      { name: "01_Brief" },
      { name: "02_Client_Documents" },
      { name: "03_Contracts" },
      { name: "04_Scope_and_Schedule" },
    ],
  },
  {
    name: "01_Proposal",
    children: [
      {
        name: "REV-00",
        children: [
          { name: "01_Input" },
          { name: "02_BOQ_Working" },
          { name: "03_RFQ_and_Quotes" },
          { name: "04_Draft" },
          { name: "05_Approval" },
          { name: "06_Submitted" },
        ],
      },
    ],
  },
  {
    name: "10_Drawings",
    children: [
      { name: "AutoCAD" },
      { name: "PDF_Set" },
      { name: "AsBuilt" },
    ],
  },
  {
    name: "20_Models",
    children: [
      { name: "SketchUp" },
      { name: "Render" },
      { name: "IFC_RVT" },
    ],
  },
  { name: "30_Client_Documents" },
  { name: "40_Site_Photos" },
  { name: "90_Archive" },
];

export type CreateDriveFolderParams = z.infer<typeof parameters>;

export interface CreateDriveFolderResult {
  success: boolean;
  rootFolder: {
    id: string;
    name: string;
    webViewLink: string | null | undefined;
  };
  createdFolderCount: number;
}

type DriveFileInsert = Database["public"]["Tables"]["drive_files"]["Insert"];

async function createFolderTree(
  drive: drive_v3.Drive,
  tenantId: string,
  projectId: string | null,
  nodes: FolderNode[],
  parentId: string,
  pathPrefix: string,
  records: DriveFileInsert[]
) {
  for (const node of nodes) {
    const folder = await createFolder(drive, node.name, parentId);
    const path = `${pathPrefix}/${node.name}`;

    records.push({
      tenant_id: tenantId,
      project_id: projectId,
      proposal_id: null,
      file_role: "folder",
      document_type: "folder",
      discipline: null,
      revision_label: path,
      drive_file_id: folder.id,
      drive_parent_id: parentId,
      mime_type: folder.mimeType ?? GOOGLE_DRIVE_FOLDER_MIME,
      web_view_link: folder.webViewLink ?? null,
      size_bytes: null,
    });

    if (node.children?.length) {
      await createFolderTree(
        drive,
        tenantId,
        projectId,
        node.children,
        folder.id,
        path,
        records
      );
    }
  }
}

export const createDriveFolder: ToolDefinition<
  typeof parameters,
  CreateDriveFolderResult
> = {
  name: "createDriveFolder",
  description:
    "Google Drive uzerinde proje icin standart klasor yapisini olusturur ve kaydeder.",
  parameters,
  execute: async (
    params,
    context: ToolContext
  ): Promise<CreateDriveFolderResult> => {
    const projectCode = params.projectCode.trim();
    const projectName = params.projectName.trim();
    const rootFolderName = `${projectCode}_${projectName}`;
    const drive = await getDriveClient();
    const rootFolder = await createFolder(drive, rootFolderName);

    const records: DriveFileInsert[] = [
      {
        tenant_id: context.tenantId,
        project_id: params.projectId ?? null,
        proposal_id: null,
        file_role: "folder",
        document_type: "project_root",
        discipline: params.customerName?.trim() || null,
        revision_label: rootFolderName,
        drive_file_id: rootFolder.id,
        drive_parent_id: null,
        mime_type: rootFolder.mimeType ?? GOOGLE_DRIVE_FOLDER_MIME,
        web_view_link: rootFolder.webViewLink ?? null,
        size_bytes: null,
      },
    ];

    await createFolderTree(
      drive,
      context.tenantId,
      params.projectId ?? null,
      folderTree,
      rootFolder.id,
      rootFolderName,
      records
    );

    const { error } = await (context.supabase as any).from("drive_files").insert(records);

    if (error) {
      throw new Error(`Drive folder records could not be saved: ${error.message}`);
    }

    return {
      success: true,
      rootFolder: {
        id: rootFolder.id,
        name: rootFolder.name ?? rootFolderName,
        webViewLink: rootFolder.webViewLink,
      },
      createdFolderCount: records.length,
    };
  },
};
