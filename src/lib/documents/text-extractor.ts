import { inflateRawSync } from "node:zlib";
import { extractText as extractPdfText, getMeta as getPdfMeta } from "unpdf";
import * as XLSX from "xlsx";

export interface ExtractedTextResult {
  text: string;
  pageCount?: number;
  metadata?: Record<string, unknown>;
}

const PDF_MIME_TYPES = new Set(["application/pdf"]);
const XLSX_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
]);
const DOCX_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function extractText(
  buffer: Buffer | ArrayBuffer | Uint8Array,
  mimeType: string | null | undefined
): Promise<ExtractedTextResult> {
  const normalizedMimeType = mimeType?.toLowerCase().trim() ?? "";
  const bytes = toUint8Array(buffer);

  try {
    if (PDF_MIME_TYPES.has(normalizedMimeType)) {
      return await extractPdf(bytes);
    }

    if (XLSX_MIME_TYPES.has(normalizedMimeType)) {
      return extractXlsx(bytes);
    }

    if (DOCX_MIME_TYPES.has(normalizedMimeType)) {
      return extractDocx(bytes);
    }

    return { text: "" };
  } catch (error) {
    console.error("[TEXT_EXTRACT_FAIL]", {
      mimeType: normalizedMimeType || null,
      error: error instanceof Error ? error.message : String(error),
    });

    return { text: "" };
  }
}

function toUint8Array(
  buffer: Buffer | ArrayBuffer | Uint8Array
): Uint8Array {
  if (buffer instanceof Uint8Array) {
    return buffer;
  }

  return new Uint8Array(buffer);
}

async function extractPdf(buffer: Uint8Array): Promise<ExtractedTextResult> {
  const [{ text, totalPages }, meta] = await Promise.all([
    extractPdfText(buffer, { mergePages: true }),
    getPdfMeta(buffer).catch(() => null),
  ]);

  return {
    text: normalizeWhitespace(text),
    pageCount: totalPages,
    metadata: meta
      ? {
          info: meta.info,
          metadata: meta.metadata,
        }
      : undefined,
  };
}

function extractXlsx(buffer: Uint8Array): ExtractedTextResult {
  const workbook = XLSX.read(buffer, {
    type: "array",
    dense: true,
  });

  const text = workbook.SheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
      sheet,
      {
        header: 1,
        raw: false,
        defval: "",
      }
    );

    const body = rows
      .map((row) =>
        row
          .map((cell) => String(cell ?? "").trim())
          .filter(Boolean)
          .join("\t")
      )
      .filter(Boolean)
      .join("\n");

    return body ? `${sheetName}\n${body}` : sheetName;
  })
    .filter(Boolean)
    .join("\n\n");

  return {
    text: normalizeWhitespace(text),
    pageCount: workbook.SheetNames.length,
    metadata: {
      sheetNames: workbook.SheetNames,
    },
  };
}

function extractDocx(buffer: Uint8Array): ExtractedTextResult {
  const xml = extractZipEntry(buffer, "word/document.xml");

  if (!xml) {
    return { text: "" };
  }

  const text = xml
    .replace(/<\/w:p>/g, "\n")
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<w:br\/>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return {
    text: normalizeWhitespace(text),
    metadata: {
      source: "docx",
    },
  };
}

function normalizeWhitespace(value: string): string {
  return value
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function extractZipEntry(
  bytes: Uint8Array,
  targetPath: string
): string | null {
  let offset = 0;

  while (offset + 30 <= bytes.length) {
    const signature = readUInt32LE(bytes, offset);
    if (signature !== 0x04034b50) {
      offset += 1;
      continue;
    }

    const compressionMethod = readUInt16LE(bytes, offset + 8);
    const compressedSize = readUInt32LE(bytes, offset + 18);
    const fileNameLength = readUInt16LE(bytes, offset + 26);
    const extraFieldLength = readUInt16LE(bytes, offset + 28);
    const fileNameStart = offset + 30;
    const fileNameEnd = fileNameStart + fileNameLength;

    if (fileNameEnd > bytes.length) {
      break;
    }

    const fileName = new TextDecoder("utf-8").decode(
      bytes.subarray(fileNameStart, fileNameEnd)
    );

    const dataStart = fileNameEnd + extraFieldLength;
    const dataEnd = dataStart + compressedSize;

    if (dataEnd > bytes.length) {
      break;
    }

    if (fileName === targetPath) {
      const fileBytes = bytes.subarray(dataStart, dataEnd);

      if (compressionMethod === 0) {
        return new TextDecoder("utf-8").decode(fileBytes);
      }

      if (compressionMethod === 8) {
        return new TextDecoder("utf-8").decode(inflateRawSync(fileBytes));
      }

      throw new Error(`Unsupported DOCX compression method: ${compressionMethod}`);
    }

    offset = dataEnd;
  }

  return null;
}

function readUInt16LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readUInt32LE(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  ) >>> 0;
}
