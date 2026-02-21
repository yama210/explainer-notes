import { z } from "zod";
import { NOTE_TYPES, SUBJECTS } from "@/lib/note-template";

export const noteInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "タイトルは必須です")
      .max(120, "タイトルは120文字以内で入力してください"),
    noteType: z.enum(NOTE_TYPES),
    subject: z.enum(SUBJECTS),
    tags: z
      .array(
        z
          .string()
          .trim()
          .min(1, "タグは空にできません")
          .max(30, "タグは30文字以内にしてください"),
      )
      .max(20, "タグは20個以内にしてください"),
    fields: z.record(
      z.string(),
      z.string().max(5000, "入力が長すぎます（5000文字以内）"),
    ),
  })
  .superRefine((data, ctx) => {
    const hasContent = Object.values(data.fields).some(
      (value) => value.trim().length > 0,
    );
    if (!hasContent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["content"],
        message: "テンプレート項目を1つ以上入力してください",
      });
    }
  });

export type NoteInput = z.infer<typeof noteInputSchema>;
