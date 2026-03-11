import { NoteStatus } from "@prisma/client";

export const noteStatusMeta: Record<
  NoteStatus,
  { label: string; classes: string }
> = {
  DRAFT: {
    label: "下書き",
    classes: "bg-stone-100 text-stone-700",
  },
  REVIEWING: {
    label: "確認中",
    classes: "bg-amber-100 text-amber-800",
  },
  EXPLAINABLE: {
    label: "説明できる",
    classes: "bg-[var(--accent-soft)] text-[var(--accent)]",
  },
  ARCHIVED: {
    label: "保管",
    classes: "bg-slate-100 text-slate-700",
  },
};

export const noteStatusOptions = Object.entries(noteStatusMeta).map(
  ([value, meta]) => ({
    value: value as NoteStatus,
    ...meta,
  }),
);

export const sortOptions = [
  { value: "updated_desc", label: "更新日が新しい順" },
  { value: "created_desc", label: "作成日が新しい順" },
  { value: "title_asc", label: "タイトル順" },
] as const;

export type NoteSort = (typeof sortOptions)[number]["value"];

export function getNextStatusAfterReview(
  currentStatus: NoteStatus,
  nextReviewCount: number,
) {
  if (currentStatus === NoteStatus.ARCHIVED) {
    return NoteStatus.ARCHIVED;
  }

  if (currentStatus === NoteStatus.EXPLAINABLE) {
    return NoteStatus.EXPLAINABLE;
  }

  if (nextReviewCount >= 2) {
    return NoteStatus.EXPLAINABLE;
  }

  return NoteStatus.REVIEWING;
}

export function getReviewTransitionGuide(
  currentStatus: NoteStatus,
  reviewCount: number,
) {
  const nextReviewCount = reviewCount + 1;
  const nextStatus = getNextStatusAfterReview(currentStatus, nextReviewCount);

  return {
    currentLabel: noteStatusMeta[currentStatus].label,
    nextLabel: noteStatusMeta[nextStatus].label,
    steps: [
      "1回目の復習完了で「確認中」へ進みます。",
      "2回目以降の復習完了で「説明できる」へ進みます。",
      "「保管」は現在の状態を維持します。",
    ],
  };
}
