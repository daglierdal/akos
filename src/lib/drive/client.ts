import { drive, type drive_v3 } from "@googleapis/drive";
import { decryptSecret, getOAuth2Client, GOOGLE_DRIVE_PROVIDER } from "./auth";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type { drive_v3 };

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

/**
 * Returns a Drive client.
 *
 * Priority:
 * 1. Env vars (GOOGLE_ACCESS_TOKEN / GOOGLE_REFRESH_TOKEN) — Faz 0.1 default
 * 2. Database (external_connections table) — used when env vars absent
 */
export async function getDriveClient(supabase?: DbClient) {
  const envAccessToken = process.env.GOOGLE_ACCESS_TOKEN;
  const envRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  const oauth2Client = getOAuth2Client();

  if (envAccessToken) {
    oauth2Client.setCredentials({
      access_token: envAccessToken,
      refresh_token: envRefreshToken ?? undefined,
    });
  } else if (supabase) {
    // Fallback: load from DB (legacy path, requires external_connections table)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: connection, error } = await (supabase as any)
      .from("external_connections")
      .select(
        "access_token_encrypted, refresh_token_encrypted, expires_at, scope, token_type"
      )
      .eq("provider", GOOGLE_DRIVE_PROVIDER)
      .maybeSingle() as { data: Record<string, unknown> | null; error: unknown };

    if (error) {
      throw new Error(`Drive connection lookup failed`);
    }

    if (!connection) {
      throw new Error("Google Drive connection was not found.");
    }

    oauth2Client.setCredentials({
      access_token: decryptSecret(connection.access_token_encrypted as string),
      refresh_token: connection.refresh_token_encrypted
        ? decryptSecret(connection.refresh_token_encrypted as string)
        : undefined,
      expiry_date: connection.expires_at
        ? new Date(connection.expires_at as string).getTime()
        : undefined,
      scope: (connection.scope as string) ?? undefined,
      token_type: (connection.token_type as string) ?? undefined,
    });
  } else {
    throw new Error(
      "No Google Drive credentials available. Set GOOGLE_ACCESS_TOKEN env var."
    );
  }

  return drive({ version: "v3", auth: oauth2Client });
}

export async function createFolder(
  driveClient: drive_v3.Drive,
  name: string,
  parentId?: string
): Promise<DriveFileHandle> {
  const { data } = await driveClient.files.create({
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
  driveClient: drive_v3.Drive,
  file: UploadableDriveFile,
  parentId?: string
): Promise<DriveFileHandle> {
  const { data } = await driveClient.files.create({
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
