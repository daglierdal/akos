export function extractProjectCodeFromLabel(label: string | null | undefined) {
  const normalized = label?.trim();

  if (!normalized) {
    return null;
  }

  const separatorIndex = normalized.indexOf("_");
  if (separatorIndex <= 0) {
    return null;
  }

  return normalized.slice(0, separatorIndex);
}
