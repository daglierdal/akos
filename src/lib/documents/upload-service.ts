import { Readable } from "node:stream";
import type { drive_v3 } from "googleapis";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createFolder, uploadFile } from "@/lib/drive/client";
import { extractProjectCodeFromLabel } from "@/lib/drive/drive-files";
import type { Database } from "@/lib/supabase/database.types";
import {
  resolveDriveRouting,
  type DocumentCategory,
} from "./routing-rules";
import { processDocument } from "./processing-service";

const SUPABASE_BUCKET = process.env.SUPABASE_DOCUMENTS_BUCKET ?? "documents";
const SUPABASE_MAX_BYTES = 50 * 1024 * 1024;
const DROPZONE_MAX_BYTES = 100 * 1024 * 1024;

const AI_READABLE_EXTENSIONS = new Set(["pdf", "xlsx", "docx", "jpg", "jpeg", "png"]);
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png"]);
const DRAWING_EXTENSIONS = new Set(["dwg", "dxf"]);
const PARSEABLE_EXTENSIONS = new Set(["pdf", "xlsx", "docx"]);
const CLIENT_DOCUMENT_HINTS = [
  "client",
  "musteri",
  "approval",
  "onay",
  "contract",
  "sozlesme",
];
const DRAWING_HINTS = [
  "drawing",
  "plan",
  "elevation",
  "section",
  "layout",
  "shop",
  "detail",
  "pafta",
  "kesit",
  "gorunus",
  "cizim",
  "asbuilt",
  "as-built",
];
const SPEC_HINTS = [
  "spec",
  "specification",
  "sartname",
  "technical",
  "teknik",
  "requirements",
  "requirement",
];
const SITE_PHOTO_HINTS = [
  "site",
  "field",
  "saha",
  "photo",
  "image",
  "inspection",
  "progress",
];
const BOQ_HINTS = [
  "boq",
  "bill of quantities",
  "quantity",
  "qty",
  "metraj",
  "kesif",
  "unit price",
  "birim fiyat",
  "amount",
  "tutar",
];

type JsonObject = Record<string, unknown>;
type TypedSupabase = SupabaseClient<Database>;
type DbRow = Database["public"]["Tables"];

type ProjectLookup = Pick<DbRow["projects"]["Row"], "id" | "name">;

export interface UploadTarget {
  kind: "supabase" | "drive";
  reason: "size" | "ai-readable" | "non-ai-readable";
}

export interface CategoryDetectionResult {
  category: DocumentCategory;
  isDrawingPdf: boolean;
  isClientDocument: boolean;
  isSitePhoto: boolean;
  confidence: "high" | "medium" | "low";
  hints: string[];
}

export interface UploadDocumentResult {
  success: boolean;
  documentId: string;
  versionId: string;
  versionNo: number;
  category: DocumentCategory;
  storageType: "supabase" | "drive";
  storagePath: string;
  standardFilename: string;
  routePath: string | null;
}

interface StoredFileResult {
  storageType: "supabase" | "drive";
  storagePath: string;
  routePath: string | null;
  metadata: JsonObject;
}

interface ProjectContext {
  project: ProjectLookup;
  tenantId: string;
  tenantPrefix: string;
  projectCode: string;
  rootFolder: DriveFolderRecord | null;
}

interface DriveFolderRecord {
  id?: string;
  tenant_id: string;
  project_id: string | null;
  proposal_id: string | null;
  file_role: string | null;
  document_type: string | null;
  discipline: string | null;
  revision_label: string | null;
  drive_file_id: string;
  drive_parent_id: string | null;
  mime_type: string | null;
  web_view_link: string | null;
  size_bytes: number | null;
}

interface DocumentRecord {
  id: string;
  standard_filename: string | null;
}

function getExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.at(-1)?.toLowerCase() ?? "" : "";
}

function stripExtension(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}

function tokenize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function includesAny(text: string, hints: string[]) {
  const haystack = text.toLowerCase();
  return hints.filter((hint) => haystack.includes(hint));
}

function buildProjectCode(projectName: string, tenantPrefix: string) {
  const tokens = tokenize(projectName).slice(0, 3);
  const initials = tokens.map((token) => token[0]?.toUpperCase() ?? "").join("");
  return `${tenantPrefix || "PRJ"}-${initials || "GEN"}`;
}

function sanitizeSegment(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, " ")
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

function getTypeCode(category: DocumentCategory) {
  switch (category) {
    case "drawing":
      return "DRW";
    case "spec":
      return "SPC";
    case "boq":
      return "BOQ";
    case "photo":
      return "PHT";
    case "model":
      return "MDL";
    case "contract":
      return "CTR";
    default:
      return "DOC";
  }
}

function padRevision(versionNo: number) {
  return `REV-${String(versionNo).padStart(2, "0")}`;
}

function parseRevision(filename: string | null) {
  if (!filename) {
    return 0;
  }

  const match = filename.match(/_REV-(\d+)\.[^.]+$/i);
  return match ? Number(match[1]) : 0;
}

async function getProjectContext(
  supabase: TypedSupabase,
  projectId: string,
  tenantId: string
): Promise<ProjectContext> {
  const [{ data: project, error: projectError }, { data: tenant, error: tenantError }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id, name")
        .eq("id", projectId)
        .eq("tenant_id", tenantId)
        .single(),
      supabase
        .from("tenants")
        .select("project_code_prefix")
        .eq("id", tenantId)
        .single(),
    ]);

  if (projectError || !project) {
    throw new Error(projectError?.message ?? "Project not found.");
  }

  if (tenantError || !tenant) {
    throw new Error(tenantError?.message ?? "Tenant not found.");
  }

  const driveQuery = (supabase as any)
    .from("drive_files")
    .select(
      [
        "id",
        "tenant_id",
        "project_id",
        "proposal_id",
        "file_role",
        "document_type",
        "discipline",
        "revision_label",
        "drive_file_id",
        "drive_parent_id",
        "mime_type",
        "web_view_link",
        "size_bytes",
      ].join(",")
    )
    .eq("tenant_id", tenantId)
    .eq("project_id", project.id)
    .eq("file_role", "folder")
    .is("drive_parent_id", null)
    .maybeSingle();

  const { data: rootFolder } = (await driveQuery) as {
    data: DriveFolderRecord | null;
    error: { message: string } | null;
  };

  return {
    project,
    tenantId,
    tenantPrefix: tenant.project_code_prefix,
    projectCode:
      extractProjectCodeFromLabel(rootFolder?.revision_label) ??
      buildProjectCode(project.name, tenant.project_code_prefix),
    rootFolder,
  };
}

export function decideUploadTarget(file: Pick<File, "name" | "size">): UploadTarget {
  const extension = getExtension(file.name);
  const aiReadable = AI_READABLE_EXTENSIONS.has(extension);

  if (file.size >= SUPABASE_MAX_BYTES) {
    return { kind: "drive", reason: "size" };
  }

  return aiReadable
    ? { kind: "supabase", reason: "ai-readable" }
    : { kind: "drive", reason: "non-ai-readable" };
}

export async function detectDocumentCategory(file: File): Promise<CategoryDetectionResult> {
  const extension = getExtension(file.name);
  const normalizedName = `${stripExtension(file.name)} ${file.type}`.toLowerCase();

  if (DRAWING_EXTENSIONS.has(extension)) {
    return {
      category: "drawing",
      isDrawingPdf: false,
      isClientDocument: false,
      isSitePhoto: false,
      confidence: "high",
      hints: [extension],
    };
  }

  if (extension === "skp") {
    return {
      category: "model",
      isDrawingPdf: false,
      isClientDocument: false,
      isSitePhoto: false,
      confidence: "high",
      hints: ["skp"],
    };
  }

  if (IMAGE_EXTENSIONS.has(extension)) {
    const photoHints = includesAny(normalizedName, SITE_PHOTO_HINTS);
    return {
      category: "photo",
      isDrawingPdf: false,
      isClientDocument: false,
      isSitePhoto: photoHints.length > 0,
      confidence: photoHints.length > 0 ? "high" : "medium",
      hints: photoHints.length > 0 ? photoHints : [extension],
    };
  }

  if (extension === "xlsx") {
    const sample = await sniffText(file, 120_000);
    const boqHints = includesAny(`${normalizedName} ${sample}`.toLowerCase(), BOQ_HINTS);

    return {
      category: boqHints.length > 0 ? "boq" : "other",
      isDrawingPdf: false,
      isClientDocument: false,
      isSitePhoto: false,
      confidence: boqHints.length > 0 ? "high" : "low",
      hints: boqHints.length > 0 ? boqHints : [extension],
    };
  }

  if (extension === "pdf") {
    const sample = await sniffText(file, 80_000);
    const joined = `${normalizedName} ${sample}`.toLowerCase();
    const drawingHints = includesAny(joined, DRAWING_HINTS);
    const specHints = includesAny(joined, SPEC_HINTS);

    if (drawingHints.length > 0 && drawingHints.length >= specHints.length) {
      return {
        category: "drawing",
        isDrawingPdf: true,
        isClientDocument: false,
        isSitePhoto: false,
        confidence: "medium",
        hints: drawingHints,
      };
    }

    return {
      category: "spec",
      isDrawingPdf: false,
      isClientDocument: false,
      isSitePhoto: false,
      confidence: specHints.length > 0 ? "medium" : "low",
      hints: specHints.length > 0 ? specHints : [extension],
    };
  }

  const clientHints = includesAny(normalizedName, CLIENT_DOCUMENT_HINTS);

  if (extension === "docx" && clientHints.length > 0) {
    return {
      category: "contract",
      isDrawingPdf: false,
      isClientDocument: true,
      isSitePhoto: false,
      confidence: "medium",
      hints: clientHints,
    };
  }

  return {
    category: "other",
    isDrawingPdf: false,
    isClientDocument: clientHints.length > 0,
    isSitePhoto: false,
    confidence: "low",
    hints: clientHints.length > 0 ? clientHints : [extension || "unknown"],
  };
}

async function sniffText(file: File, maxBytes: number) {
  const slice = file.slice(0, maxBytes);
  const text = await slice.text().catch(() => "");
  return text.replace(/\0/g, " ").slice(0, 4_000);
}

async function ensureDrivePath(
  supabase: TypedSupabase,
  driveClient: drive_v3.Drive,
  context: ProjectContext,
  pathSegments: string[]
) {
  let rootFolder = context.rootFolder;

  if (!rootFolder) {
    const rootName = `${context.projectCode}_${context.project.name}`;
    const created = await createFolder(driveClient, rootName);

    rootFolder = {
      tenant_id: context.tenantId,
      project_id: context.project.id,
      proposal_id: null,
      file_role: "folder",
      document_type: "project_root",
      discipline: null,
      revision_label: rootName,
      drive_file_id: created.id,
      drive_parent_id: null,
      mime_type: created.mimeType ?? "application/vnd.google-apps.folder",
      web_view_link: created.webViewLink ?? null,
      size_bytes: null,
    };

    const { error } = await (supabase as any).from("drive_files").insert(rootFolder);
    if (error) {
      throw new Error(`Drive root folder save failed: ${error.message}`);
    }

    context.rootFolder = rootFolder;
  }

  let parentId = rootFolder.drive_file_id;
  let currentPath = rootFolder.revision_label ?? "";

  for (const segment of pathSegments) {
    currentPath = `${currentPath}/${segment}`;

    const { data: existing } = (await (supabase as any)
      .from("drive_files")
      .select(
        "id, tenant_id, project_id, proposal_id, file_role, document_type, discipline, revision_label, drive_file_id, drive_parent_id, mime_type, web_view_link, size_bytes"
      )
      .eq("tenant_id", context.tenantId)
      .eq("project_id", context.project.id)
      .eq("file_role", "folder")
      .eq("revision_label", currentPath)
      .maybeSingle()) as { data: DriveFolderRecord | null };

    if (existing) {
      parentId = existing.drive_file_id;
      continue;
    }

    const created = await createFolder(driveClient, segment, parentId);
    const payload: DriveFolderRecord = {
      tenant_id: context.tenantId,
      project_id: context.project.id,
      proposal_id: null,
      file_role: "folder",
      document_type: "folder",
      discipline: null,
      revision_label: currentPath,
      drive_file_id: created.id,
      drive_parent_id: parentId,
      mime_type: created.mimeType ?? "application/vnd.google-apps.folder",
      web_view_link: created.webViewLink ?? null,
      size_bytes: null,
    };

    const { error } = await (supabase as any).from("drive_files").insert(payload);
    if (error) {
      throw new Error(`Drive folder save failed: ${error.message}`);
    }

    parentId = created.id;
  }

  return {
    parentId,
    rootPath: rootFolder.revision_label ?? "",
  };
}

async function storeInSupabase(
  supabase: TypedSupabase,
  file: File,
  tenantId: string,
  projectId: string,
  standardFilename: string
): Promise<StoredFileResult> {
  const storagePath = `${tenantId}/${projectId}/${standardFilename}`;
  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  return {
    storageType: "supabase",
    storagePath,
    routePath: null,
    metadata: {
      bucket: SUPABASE_BUCKET,
    },
  };
}

async function storeInDrive(
  supabase: TypedSupabase,
  driveClient: drive_v3.Drive | null,
  file: File,
  context: ProjectContext,
  standardFilename: string,
  categoryResult: CategoryDetectionResult,
  revisionLabel: string
): Promise<StoredFileResult> {
  if (!driveClient) {
    throw new Error("Google Drive connection is required for this file.");
  }

  const route = resolveDriveRouting({
    category: categoryResult.category,
    extension: getExtension(file.name),
    fileName: file.name,
    isDrawingPdf: categoryResult.isDrawingPdf,
    isSitePhoto: categoryResult.isSitePhoto,
    isClientDocument: categoryResult.isClientDocument,
    revisionLabel,
  });
  const ensuredPath = await ensureDrivePath(
    supabase,
    driveClient,
    context,
    route.pathSegments
  );
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadFile(
    driveClient,
    {
      name: standardFilename,
      mimeType: file.type || "application/octet-stream",
      body: Readable.from(buffer),
    },
    ensuredPath.parentId
  );

  const fileRecord = {
    tenant_id: context.tenantId,
    project_id: context.project.id,
    proposal_id: null,
    file_role: "file" as const,
    document_type: categoryResult.category,
    discipline: null,
    revision_label: revisionLabel,
    drive_file_id: uploaded.id,
    drive_parent_id: ensuredPath.parentId,
    mime_type: uploaded.mimeType ?? file.type ?? "application/octet-stream",
    web_view_link: uploaded.webViewLink ?? null,
    size_bytes: file.size,
  };

  const { error } = await (supabase as any).from("drive_files").insert(fileRecord);
  if (error) {
    throw new Error(`Drive file save failed: ${error.message}`);
  }

  return {
    storageType: "drive",
    storagePath: `drive/${uploaded.id}`,
    routePath: route.path,
    metadata: {
      driveFileId: uploaded.id,
      webViewLink: uploaded.webViewLink,
      routePath: route.path,
    },
  };
}

async function resolveVersion(
  supabase: TypedSupabase,
  tenantId: string,
  projectId: string,
  filenamePrefix: string
) {
  const { data, error } = await supabase
    .from("documents")
    .select("id, standard_filename")
    .eq("tenant_id", tenantId)
    .eq("project_id", projectId)
    .like("standard_filename", `${filenamePrefix}_REV-%`)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Document version lookup failed: ${error.message}`);
  }

  const records = (data ?? []) as DocumentRecord[];
  const versionNo = records.reduce((max, record) => {
    return Math.max(max, parseRevision(record.standard_filename));
  }, 0) + 1;

  return {
    versionNo,
    documentId: records[0]?.id ?? null,
  };
}

export async function uploadDocument(
  supabase: TypedSupabase,
  driveClient: drive_v3.Drive | null,
  file: File,
  projectId: string,
  tenantId: string,
  uploadedBy?: string
): Promise<UploadDocumentResult> {
  if (file.size > DROPZONE_MAX_BYTES) {
    throw new Error("File exceeds the 100MB upload limit.");
  }

  const [projectContext, categoryResult] = await Promise.all([
    getProjectContext(supabase, projectId, tenantId),
    detectDocumentCategory(file),
  ]);
  const extension = getExtension(file.name);
  const detail = sanitizeSegment(stripExtension(file.name)) || "FILE";
  const typeCode = getTypeCode(categoryResult.category);
  const filenamePrefix = `${sanitizeSegment(projectContext.projectCode)}_${typeCode}_${detail}`;
  const { versionNo, documentId } = await resolveVersion(
    supabase,
    tenantId,
    projectId,
    filenamePrefix
  );
  const revisionLabel = padRevision(versionNo);
  const standardFilename = `${filenamePrefix}_${revisionLabel}.${extension}`;
  const target = decideUploadTarget(file);

  const stored =
    target.kind === "supabase"
      ? await storeInSupabase(supabase, file, tenantId, projectId, standardFilename)
      : await storeInDrive(
          supabase,
          driveClient,
          file,
          projectContext,
          standardFilename,
          categoryResult,
          revisionLabel
        );

  const documentPayload = {
    tenant_id: tenantId,
    project_id: projectId,
    title: stripExtension(file.name),
    category: categoryResult.category,
    storage_type: stored.storageType,
    storage_path: stored.storagePath,
    original_filename: file.name,
    standard_filename: standardFilename,
    mime_type: file.type || null,
    file_size: file.size,
    parsed_text: null,
    metadata: {
      routePath: stored.routePath,
      uploadTarget: {
        kind: target.kind,
        reason: target.reason,
      },
      categoryHints: categoryResult.hints,
      categoryConfidence: categoryResult.confidence,
      ...stored.metadata,
    } as DbRow["documents"]["Insert"]["metadata"],
  };

  const document =
    documentId !== null
      ? await supabase
          .from("documents")
          .update(documentPayload)
          .eq("id", documentId)
          .select("id")
          .single()
      : await supabase.from("documents").insert(documentPayload).select("id").single();

  if (document.error || !document.data) {
    throw new Error(document.error?.message ?? "Document save failed.");
  }

  const versionInsert = await supabase
    .from("document_versions")
    .insert({
      tenant_id: tenantId,
      document_id: document.data.id,
      version_no: versionNo,
      storage_path: stored.storagePath,
      uploaded_by: uploadedBy ?? null,
    })
    .select("id")
    .single();

  if (versionInsert.error || !versionInsert.data) {
    throw new Error(versionInsert.error?.message ?? "Document version save failed.");
  }

  if (stored.storageType === "supabase" && PARSEABLE_EXTENSIONS.has(extension)) {
    const processingResult = await processDocument(supabase, document.data.id);
    if (!processingResult.success) {
      throw new Error(
        processingResult.error ?? "Document processing failed after upload."
      );
    }
  }

  return {
    success: true,
    documentId: document.data.id,
    versionId: versionInsert.data.id,
    versionNo,
    category: categoryResult.category,
    storageType: stored.storageType,
    storagePath: stored.storagePath,
    standardFilename,
    routePath: stored.routePath,
  };
}

export async function uploadDocuments(
  supabase: TypedSupabase,
  driveClient: drive_v3.Drive | null,
  files: File[],
  projectId: string,
  tenantId: string,
  uploadedBy?: string
) {
  const results: UploadDocumentResult[] = [];

  for (const file of files) {
    results.push(
      await uploadDocument(supabase, driveClient, file, projectId, tenantId, uploadedBy)
    );
  }

  return results;
}
