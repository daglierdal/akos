import { z } from "zod";
import { defineTool } from "./tool-definition";

const parameters = z.object({
  documentIds: z.array(z.string().uuid()).min(1).describe("Analiz edilecek dokuman ID'leri"),
});

function extractCandidateLines(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 10)
    .slice(0, 100)
    .map((line, index) => ({
      tempId: `candidate-${index + 1}`,
      line,
    }));
}

export const generateBOQFromDocs = defineTool({
  name: "generateBOQFromDocs",
  description:
    "Dokumanlarin parsed_text alanindan muhtemel BOQ kalemlerini satir bazli adaylar olarak cikarir.",
  needsApproval: false,
  parameters,
  execute: async (params, context) => {
    const { data, error } = await context.supabase
      .from("documents")
      .select("id, title, parsed_text")
      .in("id", params.documentIds);

    if (error) {
      throw new Error(`Document read failed: ${error.message}`);
    }

    const candidates = (data ?? []).flatMap((document) =>
      extractCandidateLines(document.parsed_text ?? "").map((candidate) => ({
        documentId: document.id,
        documentTitle: document.title,
        ...candidate,
      }))
    );

    return {
      success: true,
      count: candidates.length,
      candidates,
    };
  },
});
