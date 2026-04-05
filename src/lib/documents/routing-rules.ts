export type DocumentCategory =
  | "drawing"
  | "spec"
  | "boq"
  | "contract"
  | "photo"
  | "model"
  | "other";

export interface RoutingContext {
  category: DocumentCategory;
  extension: string;
  fileName: string;
  isDrawingPdf?: boolean;
  isSitePhoto?: boolean;
  isClientDocument?: boolean;
  revisionLabel?: string;
}

export interface RoutingDecision {
  path: string;
  pathSegments: string[];
}

function normalizeExtension(extension: string) {
  return extension.replace(/^\./, "").trim().toLowerCase();
}

export function resolveDriveRouting(context: RoutingContext): RoutingDecision {
  const extension = normalizeExtension(context.extension);
  const revisionLabel = context.revisionLabel ?? "REV-00";

  if (extension === "dwg" || extension === "dxf" || context.category === "drawing") {
    if (extension === "pdf" && !context.isDrawingPdf) {
      return {
        path: "30_Client_Documents",
        pathSegments: ["30_Client_Documents"],
      };
    }

    const pathSegments =
      extension === "pdf"
        ? ["10_Drawings", "PDF_Set"]
        : ["10_Drawings", "AutoCAD"];

    return {
      path: pathSegments.join("/"),
      pathSegments,
    };
  }

  if (extension === "skp" || context.category === "model") {
    return {
      path: "20_Models/SketchUp",
      pathSegments: ["20_Models", "SketchUp"],
    };
  }

  if (
    (extension === "jpg" || extension === "jpeg" || extension === "png") &&
    (context.isSitePhoto ?? context.category === "photo")
  ) {
    return {
      path: "40_Site_Photos",
      pathSegments: ["40_Site_Photos"],
    };
  }

  if (extension === "xlsx" || context.category === "boq") {
    return {
      path: `01_Proposal/${revisionLabel}/02_BOQ_Working`,
      pathSegments: ["01_Proposal", revisionLabel, "02_BOQ_Working"],
    };
  }

  if (context.isClientDocument || context.category === "contract" || extension === "docx") {
    return {
      path: "30_Client_Documents",
      pathSegments: ["30_Client_Documents"],
    };
  }

  return {
    path: "30_Client_Documents",
    pathSegments: ["30_Client_Documents"],
  };
}
