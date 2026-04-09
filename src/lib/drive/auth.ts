import crypto from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { createServerClient } from "@/lib/supabase/server";

const GOOGLE_DRIVE_PROVIDER = "google_drive";
const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const ENCRYPTION_VERSION = "v1";

function getRequiredEnv(name: "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function getEncryptionSecret() {
  const secret =
    process.env.GOOGLE_TOKEN_ENCRYPTION_KEY ??
    process.env.GOOGLE_CLIENT_SECRET;

  if (!secret) {
    throw new Error("GOOGLE_CLIENT_SECRET is not configured.");
  }

  return crypto.createHash("sha256").update(secret).digest();
}

function getRedirectUri() {
  return (
    process.env.GOOGLE_REDIRECT_URI ??
    "http://localhost:3000/api/drive/callback"
  );
}

function encryptSecret(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionSecret(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    ENCRYPTION_VERSION,
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

export function decryptSecret(value: string) {
  const [version, iv, tag, encrypted] = value.split(":");

  if (
    version !== ENCRYPTION_VERSION ||
    !iv ||
    !tag ||
    !encrypted
  ) {
    throw new Error("Encrypted value is malformed.");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionSecret(),
    Buffer.from(iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(tag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export function getOAuth2Client() {
  return new OAuth2Client(
    getRequiredEnv("GOOGLE_CLIENT_ID"),
    getRequiredEnv("GOOGLE_CLIENT_SECRET"),
    getRedirectUri()
  );
}

export function generateAuthUrl() {
  return getOAuth2Client().generateAuthUrl({
    access_type: "offline",
    include_granted_scopes: true,
    prompt: "consent",
    scope: [GOOGLE_DRIVE_SCOPE],
  });
}

export async function handleCallback(code: string) {
  const normalizedCode = code.trim();

  if (!normalizedCode) {
    throw new Error("Authorization code is required.");
  }

  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(normalizedCode);

  if (!tokens.access_token) {
    throw new Error("Google OAuth token exchange did not return an access token.");
  }

  oauth2Client.setCredentials(tokens);

  const tokenInfo = await oauth2Client.getTokenInfo(tokens.access_token);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const externalConn = supabase as any;
  const { data: existingConnection, error: existingConnectionError } =
    await externalConn
      .from("external_connections")
      .select("id, refresh_token_encrypted")
      .eq("user_id", userId)
      .eq("provider", GOOGLE_DRIVE_PROVIDER)
      .maybeSingle();

  if (existingConnectionError) {
    throw new Error(
      `Existing connection lookup failed: ${existingConnectionError.message}`
    );
  }

  const refreshTokenEncrypted = tokens.refresh_token
    ? encryptSecret(tokens.refresh_token)
    : existingConnection?.refresh_token_encrypted ?? null;

  const payload = {
    user_id: userId,
    provider: GOOGLE_DRIVE_PROVIDER,
    external_user_id: tokenInfo.sub ?? null,
    access_token_encrypted: encryptSecret(tokens.access_token),
    refresh_token_encrypted: refreshTokenEncrypted,
    scope: tokens.scope ?? GOOGLE_DRIVE_SCOPE,
    token_type: "Bearer",
    expires_at: tokens.expiry_date
      ? new Date(tokens.expiry_date).toISOString()
      : null,
    metadata: {
      email: tokenInfo.email ?? null,
    },
  };

  const query = existingConnection
    ? externalConn
        .from("external_connections")
        .update(payload)
        .eq("id", existingConnection.id)
    : externalConn.from("external_connections").insert(payload);

  const { error: upsertError } = await query;

  if (upsertError) {
    throw new Error(`Connection save failed: ${upsertError.message}`);
  }

  return {
    success: true,
    email: tokenInfo.email ?? null,
  };
}

export { GOOGLE_DRIVE_PROVIDER, GOOGLE_DRIVE_SCOPE };
