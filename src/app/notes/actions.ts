"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { serializeTemplateContent } from "@/lib/note-content";
import { isNoteType, TEMPLATE_FIELDS, type NoteType } from "@/lib/note-template";
import { noteInputSchema } from "@/lib/validation/note";

export type NoteFormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
};

type FormPayload = {
  title: string;
  noteType: string;
  subject: string;
  tags: string[];
  fields: Record<string, string>;
};

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of raw.split(",")) {
    const tag = part.trim();
    if (!tag) continue;

    const slug = normalizeTag(tag);
    if (seen.has(slug)) continue;

    seen.add(slug);
    result.push(tag);
  }

  return result;
}

function collectFields(noteType: NoteType, formData: FormData): Record<string, string> {
  const fields: Record<string, string> = {};

  for (const field of TEMPLATE_FIELDS[noteType]) {
    fields[field.key] = getText(formData, `field_${field.key}`).trim();
  }

  return fields;
}

function buildPayload(formData: FormData): FormPayload {
  const rawNoteType = getText(formData, "noteType");
  const safeNoteType: NoteType = isNoteType(rawNoteType) ? rawNoteType : "concept";

  return {
    title: getText(formData, "title"),
    noteType: rawNoteType,
    subject: getText(formData, "subject"),
    tags: parseTags(getText(formData, "tags")),
    fields: collectFields(safeNoteType, formData),
  };
}

function toFormState(error: ZodError): NoteFormState {
  const flattened = error.flatten();
  return {
    errors: flattened.fieldErrors,
    message: flattened.formErrors[0],
  };
}

async function upsertTags(tagNames: string[]): Promise<string[]> {
  const tags = await Promise.all(
    tagNames.map((tagName) => {
      const slug = normalizeTag(tagName);
      return prisma.tag.upsert({
        where: { slug },
        update: { name: tagName },
        create: { name: tagName, slug },
        select: { id: true },
      });
    }),
  );

  return tags.map((tag) => tag.id);
}

async function cleanupOrphanTags(): Promise<void> {
  await prisma.tag.deleteMany({
    where: {
      noteTags: {
        none: {},
      },
    },
  });
}

export async function createNoteAction(
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const payload = buildPayload(formData);
  const parsed = noteInputSchema.safeParse({
    title: payload.title,
    noteType: payload.noteType,
    subject: payload.subject,
    tags: payload.tags,
    fields: payload.fields,
  });

  if (!parsed.success) {
    return toFormState(parsed.error);
  }

  const tagIds = await upsertTags(parsed.data.tags);
  const content = serializeTemplateContent(parsed.data.noteType, parsed.data.fields);

  const note = await prisma.note.create({
    data: {
      title: parsed.data.title,
      noteType: parsed.data.noteType,
      subject: parsed.data.subject,
      content,
      noteTags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
  });

  revalidatePath("/notes");
  redirect(`/notes/${note.id}`);
}

export async function updateNoteAction(
  noteId: string,
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const payload = buildPayload(formData);
  const parsed = noteInputSchema.safeParse({
    title: payload.title,
    noteType: payload.noteType,
    subject: payload.subject,
    tags: payload.tags,
    fields: payload.fields,
  });

  if (!parsed.success) {
    return toFormState(parsed.error);
  }

  const tagIds = await upsertTags(parsed.data.tags);
  const content = serializeTemplateContent(parsed.data.noteType, parsed.data.fields);

  await prisma.note.update({
    where: { id: noteId },
    data: {
      title: parsed.data.title,
      noteType: parsed.data.noteType,
      subject: parsed.data.subject,
      content,
      noteTags: {
        deleteMany: {},
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
  });

  await cleanupOrphanTags();
  revalidatePath("/notes");
  revalidatePath(`/notes/${noteId}`);
  redirect(`/notes/${noteId}`);
}

export async function deleteNoteAction(noteId: string): Promise<void> {
  await prisma.note.delete({
    where: { id: noteId },
  });

  await cleanupOrphanTags();
  revalidatePath("/notes");
  redirect("/notes");
}
