import { importBOQFromExcel } from "@/lib/boq/import-service";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.app_metadata?.tenant_id;

  if (typeof tenantId !== "string" || tenantId.length === 0) {
    return Response.json({ error: "Tenant context is missing" }, { status: 403 });
  }

  const formData = await req.formData();
  const projectId = formData.get("projectId");
  const file = formData.get("file");

  if (typeof projectId !== "string" || projectId.length === 0) {
    return Response.json({ error: "projectId is required" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return Response.json({ error: "file is required" }, { status: 400 });
  }

  try {
    const result = await importBOQFromExcel(supabase, file, projectId, tenantId);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "BOQ import failed.",
      },
      { status: 500 }
    );
  }
}
