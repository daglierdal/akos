import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { extractText } from "./text-extractor";

type ProcessingSupabase = Pick<
  SupabaseClient<Database>,
  "from" | "storage"
>;

interface ProcessDocumentResult {
  success: boolean;
  jobId?: string;
  textLength?: number;
  error?: string;
}

const DEFAULT_STORAGE_BUCKET = "documents";

export async function processDocument(
  supabase: ProcessingSupabase,
  documentId: string
): Promise<ProcessDocumentResult> {
  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("id, tenant_id, storage_type, storage_path, mime_type")
    .eq("id", documentId)
    .single();

  if (documentError || !document) {
    const errorMessage = documentError?.message ?? "Document not found";
    console.error("[DOCUMENT_PROCESS_FAIL]", {
      documentId,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }

  const { data: job, error: jobInsertError } = await supabase
    .from("document_processing_jobs")
    .insert({
      tenant_id: document.tenant_id,
      document_id: document.id,
      job_type: "parse",
      status: "pending",
      error: null,
    })
    .select("id")
    .single();

  if (jobInsertError || !job) {
    const errorMessage = jobInsertError?.message ?? "Parse job could not be created";
    console.error("[DOCUMENT_PROCESS_FAIL]", {
      documentId,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }

  try {
    await updateJobStatus(supabase, job.id, {
      status: "processing",
      error: null,
    });

    if (document.storage_type !== "supabase") {
      throw new Error(
        `Unsupported storage type for parsing: ${document.storage_type ?? "unknown"}`
      );
    }

    const { bucket, path } = resolveStorageLocation(document.storage_path);

    const { data: file, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(path);

    if (downloadError || !file) {
      throw new Error(downloadError?.message ?? "Document download failed");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extracted = await extractText(buffer, document.mime_type);

    const { error: updateDocumentError } = await supabase
      .from("documents")
      .update({
        parsed_text: extracted.text,
      })
      .eq("id", document.id);

    if (updateDocumentError) {
      throw new Error(updateDocumentError.message);
    }

    await updateJobStatus(supabase, job.id, {
      status: "done",
      error: null,
    });

    return {
      success: true,
      jobId: job.id,
      textLength: extracted.text.length,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown document processing error";

    console.error("[DOCUMENT_PROCESS_FAIL]", {
      documentId,
      jobId: job.id,
      error: errorMessage,
    });

    await updateJobStatus(supabase, job.id, {
      status: "failed",
      error: errorMessage,
    });

    return {
      success: false,
      jobId: job.id,
      error: errorMessage,
    };
  }
}

function resolveStorageLocation(storagePath: string | null): {
  bucket: string;
  path: string;
} {
  if (!storagePath) {
    throw new Error("Document storage_path is empty");
  }

  if (storagePath.startsWith("/")) {
    return {
      bucket: DEFAULT_STORAGE_BUCKET,
      path: storagePath.slice(1),
    };
  }

  if (storagePath.includes(":")) {
    const [bucket, ...rest] = storagePath.split(":");
    const path = rest.join(":").replace(/^\/+/, "");

    if (bucket && path) {
      return { bucket, path };
    }
  }

  const slashIndex = storagePath.indexOf("/");
  if (slashIndex > 0) {
    return {
      bucket: storagePath.slice(0, slashIndex),
      path: storagePath.slice(slashIndex + 1),
    };
  }

  return {
    bucket: DEFAULT_STORAGE_BUCKET,
    path: storagePath,
  };
}

async function updateJobStatus(
  supabase: ProcessingSupabase,
  jobId: string,
  payload: Database["public"]["Tables"]["document_processing_jobs"]["Update"]
) {
  const { error } = await supabase
    .from("document_processing_jobs")
    .update(payload)
    .eq("id", jobId);

  if (error) {
    throw new Error(error.message);
  }
}
