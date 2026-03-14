import { formatDateInput } from "./format";
import type { NoteStatusValue } from "./note-status";

export type NoteFormValues = {
  title: string;
  summary: string;
  explanation: string;
  stuckPoints: string;
  nextActions: string;
  body: string;
  tagsText: string;
  status: NoteStatusValue;
  needsReview: boolean;
  reviewDueAt: string;
};

type EditableNoteSource = {
  title: string;
  summary: string;
  explanation: string;
  stuckPoints: string;
  nextActions: string;
  body: string;
  tags: string[];
  status: NoteStatusValue;
  needsReview: boolean;
  reviewDueAt: Date | null;
};

export const emptyNoteFormValues: NoteFormValues = {
  title: "",
  summary: "",
  explanation: "",
  stuckPoints: "",
  nextActions: "",
  body: "",
  tagsText: "",
  status: "DRAFT",
  needsReview: true,
  reviewDueAt: "",
};

export function toNoteFormValues(note: EditableNoteSource): NoteFormValues {
  return {
    title: note.title,
    summary: note.summary,
    explanation: note.explanation,
    stuckPoints: note.stuckPoints,
    nextActions: note.nextActions,
    body: note.body,
    tagsText: note.tags.join(", "),
    status: note.status,
    needsReview: note.needsReview,
    reviewDueAt: formatDateInput(note.reviewDueAt),
  };
}
