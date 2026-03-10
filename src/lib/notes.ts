import { notFound } from "next/navigation";
import { getNextStatusAfterReview } from "./note-status";
import {
  buildDashboardStats,
  buildNoteWhere,
  buildOverdueReviewList,
  buildRevisionDiff,
  buildReviewQueue,
  collectTopTags,
  getNextReviewDueAt,
  getNextReviewIntervalDays,
  getOrderBy,
  matchRelatedNotes,
  parseRelatedNotePreset,
  resolveRelatedNoteWeights,
  type RelatedNotePreset,
} from "./note-helpers";
import {
  countNotes,
  createNoteWithRevision,
  findAllNoteTags,
  findDashboardStatsNotes,
  findNoteByIdWithRevisions,
  findNoteForEdit as findEditableNote,
  findNotesForList,
  findNotesForStats,
  findRecentNotes,
  findRelatedNoteCandidates,
  findRevisionForNote,
  findTodayReviewNotes,
  removeNote,
  restoreRevisionWithSnapshot,
  updateNoteWithRevision,
  updateReviewStateWithRevision,
} from "./note-repository";
import type { NoteListRecord, NoteRevisionRecord } from "./note-repository";
import type { NoteInput, NoteListQuery } from "./validation";

export async function listNotes(filters: NoteListQuery) {
  const where = buildNoteWhere(filters);
  const orderBy = getOrderBy(filters.sort);

  const [notes, total, allTags, allNotesForStats] = await Promise.all([
    findNotesForList(where, orderBy),
    countNotes(where),
    findAllNoteTags(),
    findNotesForStats(),
  ]);

  return {
    notes,
    total,
    availableTags: collectTopTags(allTags).slice(0, 10),
    stats: buildDashboardStats(allNotesForStats),
    reviewQueue: buildReviewQueue(allNotesForStats, 4),
    overdueNotes: buildOverdueReviewList(allNotesForStats, 4),
  };
}

export async function getDashboardData() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [recentNotes, todayReviewNotes, statsSource] = await Promise.all([
    findRecentNotes(4),
    findTodayReviewNotes(start, end, 4),
    findDashboardStatsNotes(),
  ]);

  return {
    recentNotes,
    todayReviewNotes,
    reviewQueue: buildReviewQueue(statsSource, 4),
    overdueNotes: buildOverdueReviewList(statsSource, 4),
    stats: buildDashboardStats(statsSource),
  };
}

export async function getNoteById(
  id: string,
  revisionId?: string,
  relatedPresetInput?: string,
) {
  const note = await findNoteByIdWithRevisions(id);

  if (!note) {
    notFound();
  }

  const relatedPreset = parseRelatedNotePreset(relatedPresetInput);
  const relatedWeights = resolveRelatedNoteWeights(relatedPreset);
  const relatedCandidates = await findRelatedNoteCandidates(note.id, 24);
  const relatedMatches = matchRelatedNotes(note, relatedCandidates, 3, relatedWeights);
  const selectedRevision =
    note.revisions.find((revision) => revision.id === revisionId) ?? note.revisions[0] ?? null;
  const selectedIndex = selectedRevision
    ? note.revisions.findIndex((revision) => revision.id === selectedRevision.id)
    : -1;
  const previousRevision =
    selectedIndex >= 0 && selectedIndex < note.revisions.length - 1
      ? note.revisions[selectedIndex + 1]
      : null;

  return {
    note,
    relatedMatches,
    relatedPreset,
    selectedRevision,
    revisionDiff: selectedRevision ? buildRevisionDiff(selectedRevision, previousRevision) : [],
  };
}

export async function getNoteForEdit(id: string) {
  const note = await findEditableNote(id);

  if (!note) {
    notFound();
  }

  return note;
}

export async function createNote(input: NoteInput) {
  return createNoteWithRevision(input);
}

export async function updateNote(id: string, input: NoteInput) {
  return updateNoteWithRevision(id, input);
}

export async function completeReview(id: string) {
  const note = await findEditableNote(id);

  if (!note) {
    notFound();
  }

  const nextReviewCount = note.reviewCount + 1;
  const intervalDays = getNextReviewIntervalDays(note.reviewCount);
  const nextReviewDueAt = getNextReviewDueAt(note.reviewCount);
  const nextStatus = getNextStatusAfterReview(note.status, nextReviewCount);

  const updatedNote = await updateReviewStateWithRevision(id, {
    status: nextStatus,
    needsReview: true,
    reviewDueAt: nextReviewDueAt,
    reviewCount: nextReviewCount,
    lastReviewedAt: new Date(),
  });

  return {
    note: updatedNote,
    intervalDays,
    previousStatus: note.status,
    nextStatus,
  };
}

export async function restoreRevision(noteId: string, revisionId: string) {
  const revision = await findRevisionForNote(noteId, revisionId);

  if (!revision) {
    notFound();
  }

  return restoreRevisionWithSnapshot(noteId, revision);
}

export async function deleteNote(id: string) {
  await removeNote(id);
}

export type ListNoteItem = NoteListRecord;
export type NoteRevisionItem = NoteRevisionRecord;
export type { RelatedNotePreset };
