import type { drive_v3 } from "googleapis";
import { google } from "googleapis";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { decryptSecret, getOAuth2Client } from "./auth";

type DbClient = Pick<SupabaseClient<Database>, "from">;

export interface DriveFileHandle {
  id: string;
  mimeType: string | null | undefined;
  name: string | null | undefined;
  parents: string[] | null | undefined;
  webViewLink: string | null | undefined;
}

export interface UploadableDriveFile {
  body: NodeJS.ReadableStream | Buffer | string;
  mimeType?: string;
  name: string;
}

export async function getDriveClient(supabase: DbClient, tenantId: string) {
  const { data: connection, error } = await (supabase as any)
    .from("external_connections")
    .select(
      "access_token_encrypted, refresh_token_encrypted, expires_at, scope, token_type"
    )
    .eq("tenant_id", tenantId)
    .eq("provider", "google_drive")
    .maybeSingle() as { data: Record<string, any> | null; error: any };

  if (error) {
    throw new Error(`Drive connection lookup failed: ${error.message}`);
  }

  if (!connection) {
    throw new Error("Google Drive connection was not found for this tenant.");
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: decryptSecret(connection.access_token_encrypted),
    refresh_token: connection.refresh_token_encrypted
      ? decryptSecret(connection.refresh_token_encrypted)
      : undefined,
    expiry_date: connection.expires_at
      ? new Date(connection.expires_at).getTime()
      : undefined,
    scope: connection.scope ?? undefined,
    token_type: connection.token_type ?? undefined,
  });

  return google.drive({
    version: "v3",
    auth: oauth2Client,
  });
}

export async function createFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId?: string
): Promise<DriveFileHandle> {
  const { data } = await drive.files.create({
    fields: "id,name,mimeType,parents,webViewLink",
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : undefined,
    },
  });

  if (!data.id) {
    throw new Error(`Google Drive folder creation failed for "${name}".`);
  }

  return {
    id: data.id,
    mimeType: data.mimeType,
    name: data.name,
    parents: data.parents,
    webViewLink: data.webViewLink,
  };
}

export async function uploadFile(
  drive: drive_v3.Drive,
  file: UploadableDriveFile,
  parentId?: string
): Promise<DriveFileHandle> {
  const { data } = await drive.files.create({
    fields: "id,name,mimeType,parents,webViewLink",
    media: {
      body: file.body,
      mimeType: file.mimeType ?? "application/octet-stream",
    },
    requestBody: {
      name: file.name,
      parents: parentId ? [parentId] : undefined,
    },
  });

  if (!data.id) {
    throw new Error(`Google Drive upload failed for "${file.name}".`);
  }

  return {
    id: data.id,
    mimeType: data.mimeType,
    name: data.name,
    parents: data.parents,
    webViewLink: data.webViewLink,
  };
}
