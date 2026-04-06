function normalizePrefix(prefix: string | null | undefined) {
  const cleaned = (prefix ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "");

  return cleaned || "PRJ";
}

export function formatProjectSequence(sequence: number) {
  return String(Math.max(1, sequence)).padStart(4, "0");
}

export function generateProjectCode(input: {
  prefix?: string | null;
  year?: number;
  sequence: number;
}) {
  const year = input.year ?? new Date().getUTCFullYear();
  return `${normalizePrefix(input.prefix)}-${year}-${formatProjectSequence(input.sequence)}`;
}
