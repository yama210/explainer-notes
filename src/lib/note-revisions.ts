import type { NoteRevisionRecord } from "./note-repository";
import { excerpt, stripMarkdown } from "./utils";

export type RevisionDiffItem = {
  label: string;
  before: string;
  after: string;
};

type RevisionComparable = Pick<
  NoteRevisionRecord,
  | "title"
  | "summary"
  | "explanation"
  | "stuckPoints"
  | "nextActions"
  | "body"
  | "tags"
  | "status"
  | "needsReview"
  | "reviewDueAt"
  | "reviewCount"
>;

export function buildRevisionDiff(
  selected: RevisionComparable,
  previous: RevisionComparable | null,
) {
  if (!previous) {
    return [] satisfies RevisionDiffItem[];
  }

  const fields: Array<{
    key: keyof RevisionComparable;
    label: string;
    format?: (value: RevisionComparable[keyof RevisionComparable]) => string;
  }> = [
    { key: "title", label: "タイトル" },
    { key: "summary", label: "要点" },
    { key: "explanation", label: "説明" },
    { key: "stuckPoints", label: "つまずき・疑問" },
    { key: "nextActions", label: "次にやること" },
    {
      key: "body",
      label: "本文",
      format: (value) => excerpt(stripMarkdown(String(value)), 140),
    },
    {
      key: "tags",
      label: "タグ",
      format: (value) => (value as string[]).join(", ") || "なし",
    },
    { key: "status", label: "ステータス", format: (value) => String(value) },
    {
      key: "needsReview",
      label: "復習設定",
      format: (value) => ((value as boolean) ? "復習する" : "復習しない"),
    },
    {
      key: "reviewDueAt",
      label: "復習予定日",
      format: (value) => formatDateOnly(value),
    },
    {
      key: "reviewCount",
      label: "復習回数",
      format: (value) => `${value as number}回`,
    },
  ];

  return fields
    .filter(({ key }) => !isSameFieldValue(selected[key], previous[key]))
    .map(({ key, label, format }) => ({
      label,
      before: format ? format(previous[key]) : excerpt(String(previous[key] ?? "未設定"), 140),
      after: format ? format(selected[key]) : excerpt(String(selected[key] ?? "未設定"), 140),
    }));
}

function formatDateOnly(value: RevisionComparable[keyof RevisionComparable]) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (value) {
    return new Date(String(value)).toISOString().slice(0, 10);
  }

  return "未設定";
}

function isSameFieldValue(
  left: RevisionComparable[keyof RevisionComparable],
  right: RevisionComparable[keyof RevisionComparable],
) {
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.join(",") === right.join(",");
  }

  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime();
  }

  return left === right;
}
