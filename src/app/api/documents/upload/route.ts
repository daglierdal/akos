import { getDriveClient } from "@/lib/drive/client";
import { uploadDocuments } from "@/lib/documents/upload-service";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const formData = await req.formData();
  const projectId = formData.get("projectId");

  if (typeof projectId !== "string" || projectId.length === 0) {
    return Response.json({ error: "projectId is required" }, { status: 400 });
  }

  const allEntries = formData.getAll("files");
  const fallbackFile = formData.get("file");
  const files = allEntries.length > 0 ? allEntries : fallbackFile ? [fallbackFile] : [];
  const uploadableFiles = files.filter((entry): entry is File => entry instanceof File);

  if (uploadableFiles.length === 0) {
    return Response.json({ error: "At least one file is required" }, { status: 400 });
  }

  const driveClient = await getDriveClient().catch(() => null);
  const results = await uploadDocuments(
    supabase,
    driveClient,
    uploadableFiles,
    projectId,
    userId,
    userId
  );

  return Response.json({
    success: true,
    files: results,
  });
}
