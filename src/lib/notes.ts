import { notFound } from "next/navigation";
import { getNextStatusAfterReview } from "./note-status";
import {
  buildDashboardStats,
  buildNoteWhere,
  buildOverdueReviewList,
  buildReviewQueue,
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
  createNoteRecord,
  findAllNoteTags,
  findDashboardStatsNotes,
  findNoteById,
  findNoteForEdit as findEditableNote,
  findNotesForList,
  findNotesForStats,
  findRecentNotes,
  findRelatedNoteCandidates,
  findTodayReviewNotes,
  removeNote,
  updateNoteRecord,
  updateReviewState,
} from "./note-repository";
import type { NoteListRecord } from "./note-repository";
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
    availableTags: allTags
      .flatMap((record) => record.tags)
      .reduce<Array<{ tag: string; count: number }>>((acc, tag) => {
        const existing = acc.find((item) => item.tag === tag);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ tag, count: 1 });
        }
        return acc;
      }, [])
      .sort((left, right) => right.count - left.count || left.tag.localeCompare(right.tag))
      .slice(0, 10),
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

export async function getNoteById(id: string, relatedPresetInput?: string) {
  const note = await findNoteById(id);

  if (!note) {
    notFound();
  }

  const relatedPreset = parseRelatedNotePreset(relatedPresetInput);
  const relatedWeights = resolveRelatedNoteWeights(relatedPreset);
  const relatedCandidates = await findRelatedNoteCandidates(note.id, 24);
  const relatedMatches = matchRelatedNotes(note, relatedCandidates, 3, relatedWeights);

  return {
    note,
    relatedMatches,
    relatedPreset,
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
  return createNoteRecord(input);
}

export async function updateNote(id: string, input: NoteInput) {
  return updateNoteRecord(id, input);
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

  const updatedNote = await updateReviewState(id, {
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

export async function deleteNote(id: string) {
  await removeNote(id);
}

export type ListNoteItem = NoteListRecord;
export type { RelatedNotePreset };
