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
    relatedPreset?: RelatedNotePreset;
  } = {},
) {
  const params = new URLSearchParams();

  if (options.relatedPreset && options.relatedPreset !== "balanced") {
    params.set("related", options.relatedPreset);
  }

  const search = params.toString();
  return search ? `/notes/${noteId}?${search}` : `/notes/${noteId}`;
}
