import { Edge, ValidationResult } from "./types";

const EDGE_REGEX = /^[A-Z]->[A-Z]$/;

export function validateEntries(entries: string[]): ValidationResult {
  const validEdges: Edge[] = [];
  const invalidEntries: string[] = [];

  for (const entry of entries) {
    const trimmed = entry.trim();

    // Format check
    if (!EDGE_REGEX.test(trimmed)) {
      invalidEntries.push(entry);
      continue;
    }

    const [parent, child] = trimmed.split("->");

    // Self loop check
    if (parent === child) {
      invalidEntries.push(entry);
      continue;
    }

    validEdges.push({
      parent,
      child,
      raw: trimmed,
    });
  }

  return {
    validEdges,
    invalidEntries,
  };
}
