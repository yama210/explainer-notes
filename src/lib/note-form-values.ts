import { NoteStatus } from "@prisma/client";
import { formatDateInput } from "./format";

export type NoteFormValues = {
  title: string;
  summary: string;
  explanation: string;
  stuckPoints: string;
  nextActions: string;
  body: string;
  tagsText: string;
  status: NoteStatus;
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
  status: NoteStatus;
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
  status: NoteStatus.DRAFT,
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
