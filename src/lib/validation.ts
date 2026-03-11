import { NoteStatus } from "@prisma/client";
import { z } from "zod";
import { sortOptions } from "./note-status";

export const noteStatusSchema = z.nativeEnum(NoteStatus);

export const defaultNoteListQuery = {
  q: "",
  status: "ALL",
  tag: "",
  sort: "updated_desc",
  review: "all",
} as const;

const reviewDueAtSchema = z.union([z.string(), z.date(), z.null(), z.undefined()]);

function parseReviewDueAt(value: string | Date | null | undefined) {
  if (value == null || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  const normalized = value.includes("T") ? value.slice(0, 10) : value;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);

  if (!match) {
    return new Date(Number.NaN);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return new Date(Number.NaN);
  }

  return parsed;
}

export function startOfDay(base = new Date()) {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate());
}

export const noteInputSchema = z
  .object({
    title: z.string().trim().min(1, "タイトルは必須です。").max(120),
    summary: z
      .string()
      .trim()
      .max(280, "要点は280文字以内で入力してください。"),
    explanation: z
      .string()
      .trim()
      .max(4000, "自分の言葉での説明は4000文字以内で入力してください。"),
    stuckPoints: z
      .string()
      .trim()
      .max(3000, "つまずき・疑問は3000文字以内で入力してください。"),
    nextActions: z
      .string()
      .trim()
      .max(3000, "次にやることは3000文字以内で入力してください。"),
    body: z.string().trim().max(20000, "本文は20000文字以内で入力してください。"),
    tags: z.array(z.string().trim().min(1).max(30)).max(10),
    status: noteStatusSchema,
    needsReview: z.boolean(),
    reviewDueAt: reviewDueAtSchema,
  })
  .transform((input) => ({
    ...input,
    tags: Array.from(
      new Set(
        input.tags
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0),
      ),
    ).slice(0, 10),
    reviewDueAt: parseReviewDueAt(input.reviewDueAt),
  }))
  .superRefine((input, ctx) => {
    if (input.reviewDueAt && Number.isNaN(input.reviewDueAt.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reviewDueAt"],
        message: "復習予定日は正しい日付で入力してください。",
      });
      return;
    }

    if (input.needsReview && !input.reviewDueAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reviewDueAt"],
        message: "要復習にする場合は復習予定日を入力してください。",
      });
      return;
    }

    if (input.reviewDueAt && input.reviewDueAt < startOfDay()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reviewDueAt"],
        message: "復習予定日は今日以降の日付を入力してください。",
      });
    }
  });

export type NoteInput = z.infer<typeof noteInputSchema>;

const allowedSortValues = sortOptions.map((option) => option.value);

export const noteListQuerySchema = z.object({
  q: z.string().trim().max(100).optional().default(defaultNoteListQuery.q),
  status: z
    .union([noteStatusSchema, z.literal("ALL")])
    .optional()
    .default(defaultNoteListQuery.status),
  tag: z.string().trim().max(30).optional().default(defaultNoteListQuery.tag),
  sort: z
    .enum(allowedSortValues as [typeof allowedSortValues[number], ...typeof allowedSortValues])
    .optional()
    .default(defaultNoteListQuery.sort),
  review: z
    .enum(["all", "needs_review", "due_soon", "overdue"])
    .optional()
    .default(defaultNoteListQuery.review),
});

export type NoteListQuery = z.infer<typeof noteListQuerySchema>;

export function parseTagInput(tagsText: string) {
  return tagsText
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}
