import { z } from "zod";
import type { drive_v3 } from "googleapis";
import { createFolder, getDriveClient } from "@/lib/drive/client";
import type { ToolContext, ToolDefinition } from "./index";

const GOOGLE_DRIVE_FOLDER_MIME = "application/vnd.google-apps.folder";

const parameters = z.object({
  projectCode: z.string().min(1).describe("Proje kodu"),
  projectName: z.string().min(1).describe("Proje adi"),
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

type DriveFileInsert = {
  tenant_id: string;
  provider: "google_drive";
  external_file_id: string;
  parent_external_file_id: string | null;
  project_code: string;
  project_name: string;
  name: string;
  path: string;
  mime_type: string;
  web_view_link: string | null;
  is_folder: true;
  metadata: {
    path: string;
  };
};

async function createFolderTree(
  drive: drive_v3.Drive,
  context: ToolContext,
  projectCode: string,
  projectName: string,
  nodes: FolderNode[],
  parentId: string,
  pathPrefix: string,
  records: DriveFileInsert[]
) {
  for (const node of nodes) {
    const folder = await createFolder(drive, node.name, parentId);
    const path = `${pathPrefix}/${node.name}`;

    records.push({
      tenant_id: context.tenantId,
      provider: "google_drive",
      external_file_id: folder.id,
      parent_external_file_id: parentId,
      project_code: projectCode,
      project_name: projectName,
      name: folder.name ?? node.name,
      path,
      mime_type: folder.mimeType ?? GOOGLE_DRIVE_FOLDER_MIME,
      web_view_link: folder.webViewLink ?? null,
      is_folder: true,
      metadata: { path },
    });

    if (node.children?.length) {
      await createFolderTree(
        drive,
        context,
        projectCode,
        projectName,
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
    const drive = await getDriveClient(context.supabase, context.tenantId);
    const rootFolder = await createFolder(drive, rootFolderName);

    const records: DriveFileInsert[] = [
      {
        tenant_id: context.tenantId,
        provider: "google_drive",
        external_file_id: rootFolder.id,
        parent_external_file_id: null,
        project_code: projectCode,
        project_name: projectName,
        name: rootFolder.name ?? rootFolderName,
        path: rootFolderName,
        mime_type: rootFolder.mimeType ?? GOOGLE_DRIVE_FOLDER_MIME,
        web_view_link: rootFolder.webViewLink ?? null,
        is_folder: true,
        metadata: { path: rootFolderName },
      },
    ];

    await createFolderTree(
      drive,
      context,
      projectCode,
      projectName,
      folderTree,
      rootFolder.id,
      rootFolderName,
      records
    );

    const { error } = await context.supabase.from("drive_files").insert(records);

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
