import type { RelatedNotePreset } from "./note-helpers";
import { defaultNoteListQuery, type NoteListQuery } from "./validation";

export function buildNotesHref(overrides: Partial<NoteListQuery> = {}) {
  const filters: NoteListQuery = {
    ...defaultNoteListQuery,
    ...overrides,
  };
  const params = new URLSearchParams();

  const query = filters.q.trim();
  if (query) {
    params.set("q", query);
  }

  if (filters.status !== defaultNoteListQuery.status) {
    params.set("status", filters.status);
  }

  if (filters.tag) {
    params.set("tag", filters.tag);
  }

  if (filters.review !== defaultNoteListQuery.review) {
    params.set("review", filters.review);
  }

  if (filters.sort !== defaultNoteListQuery.sort) {
    params.set("sort", filters.sort);
  }

  const search = params.toString();
  return search ? `/notes?${search}` : "/notes";
}

export function buildNoteDetailHref(
  noteId: string,
  options: {
    revisionId?: string;
    relatedPreset?: RelatedNotePreset;
    restoredFrom?: string;
  } = {},
) {
  const params = new URLSearchParams();

  if (options.revisionId) {
    params.set("revision", options.revisionId);
  }

  if (options.relatedPreset && options.relatedPreset !== "balanced") {
    params.set("related", options.relatedPreset);
  }

  if (options.restoredFrom) {
    params.set("restoredFrom", options.restoredFrom);
  }

  const search = params.toString();
  return search ? `/notes/${noteId}?${search}` : `/notes/${noteId}`;
}
