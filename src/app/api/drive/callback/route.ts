import { NextResponse } from "next/server";
import { handleCallback } from "@/lib/drive/auth";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const redirectUrl = new URL("/ayarlar", requestUrl.origin);
  const error = requestUrl.searchParams.get("error");
  const code = requestUrl.searchParams.get("code");

  if (error) {
    redirectUrl.searchParams.set("drive", "error");
    redirectUrl.searchParams.set("message", error);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    redirectUrl.searchParams.set("drive", "error");
    redirectUrl.searchParams.set("message", "missing_code");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    await handleCallback(code);
    redirectUrl.searchParams.set("drive", "connected");
  } catch (callbackError) {
    redirectUrl.searchParams.set("drive", "error");
    redirectUrl.searchParams.set(
      "message",
      callbackError instanceof Error
        ? callbackError.message
        : "drive_callback_failed"
    );
  }

  return NextResponse.redirect(redirectUrl);
}
