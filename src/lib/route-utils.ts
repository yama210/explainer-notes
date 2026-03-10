import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

export function getFirstValidationMessage(error: ZodError, fallback = "入力内容を確認してください。") {
  return error.issues[0]?.message ?? fallback;
}

export function isPrismaNotFoundError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"
  );
}

export function revalidateNotePages(noteId?: string, options?: { includeEdit?: boolean }) {
  revalidatePath("/");
  revalidatePath("/notes");

  if (!noteId) {
    return;
  }

  revalidatePath(`/notes/${noteId}`);

  if (options?.includeEdit) {
    revalidatePath(`/notes/${noteId}/edit`);
  }
}
