import { TEMPLATE_FIELDS, type NoteType } from "@/lib/note-template";

type StoredTemplateContent = {
  noteType: NoteType;
  fields: Record<string, string>;
};

export function serializeTemplateContent(
  noteType: NoteType,
  fields: Record<string, string>,
): string {
  const allowedKeys = TEMPLATE_FIELDS[noteType].map((field) => field.key);
  const normalized: Record<string, string> = {};

  for (const key of allowedKeys) {
    normalized[key] = (fields[key] ?? "").trim();
  }

  return JSON.stringify({ noteType, fields: normalized });
}

export function parseTemplateContent(
  noteType: NoteType,
  content: string,
): Record<string, string> | null {
  try {
    const parsed = JSON.parse(content) as StoredTemplateContent;
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    if (
      typeof parsed.fields !== "object" ||
      parsed.fields === null ||
      Array.isArray(parsed.fields)
    ) {
      return null;
    }

    const result: Record<string, string> = {};
    for (const field of TEMPLATE_FIELDS[noteType]) {
      const value = parsed.fields[field.key];
      result[field.key] = typeof value === "string" ? value : "";
    }
    return result;
  } catch {
    return null;
  }
}
