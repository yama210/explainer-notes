import { Note, Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import type { NoteInput } from "./validation";

export const noteListSelect = {
  id: true,
  title: true,
  summary: true,
  explanation: true,
  body: true,
  tags: true,
  status: true,
  updatedAt: true,
  createdAt: true,
  needsReview: true,
  reviewDueAt: true,
  reviewCount: true,
  lastReviewedAt: true,
} satisfies Prisma.NoteSelect;

export const dashboardStatSelect = {
  id: true,
  title: true,
  summary: true,
  explanation: true,
  status: true,
  updatedAt: true,
  tags: true,
  needsReview: true,
  reviewDueAt: true,
  reviewCount: true,
  lastReviewedAt: true,
} satisfies Prisma.NoteSelect;

export const noteRevisionSelect = {
  id: true,
  title: true,
  summary: true,
  explanation: true,
  stuckPoints: true,
  nextActions: true,
  body: true,
  tags: true,
  status: true,
  needsReview: true,
  reviewDueAt: true,
  reviewCount: true,
  lastReviewedAt: true,
  createdAt: true,
} satisfies Prisma.NoteRevisionSelect;

export type NoteListRecord = Prisma.NoteGetPayload<{
  select: typeof noteListSelect;
}>;

export type DashboardStatRecord = Prisma.NoteGetPayload<{
  select: typeof dashboardStatSelect;
}>;

export type NoteRevisionRecord = Prisma.NoteRevisionGetPayload<{
  select: typeof noteRevisionSelect;
}>;

export type NoteDetailRecord = Prisma.NoteGetPayload<{
  include: {
    revisions: {
      select: typeof noteRevisionSelect;
    };
  };
}>;

type NoteSnapshotSource = Pick<
  Note,
  | "id"
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
  | "lastReviewedAt"
>;

export async function findNotesForList(
  where: Prisma.NoteWhereInput,
  orderBy: Prisma.NoteOrderByWithRelationInput,
) {
  return prisma.note.findMany({
    where,
    orderBy,
    select: noteListSelect,
  });
}

export async function countNotes(where: Prisma.NoteWhereInput) {
  return prisma.note.count({ where });
}

export async function findAllNoteTags() {
  return prisma.note.findMany({
    select: {
      tags: true,
    },
  });
}

export async function findNotesForStats() {
  return prisma.note.findMany({
    select: dashboardStatSelect,
  });
}

export async function findRecentNotes(limit: number) {
  return prisma.note.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
    select: noteListSelect,
  });
}

export async function findTodayReviewNotes(start: Date, end: Date, limit: number) {
  return prisma.note.findMany({
    where: {
      needsReview: true,
      reviewDueAt: {
        gte: start,
        lt: end,
      },
    },
    orderBy: [{ reviewDueAt: "asc" }, { updatedAt: "desc" }],
    take: limit,
    select: noteListSelect,
  });
}

export async function findDashboardStatsNotes() {
  return prisma.note.findMany({
    select: dashboardStatSelect,
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function findNoteByIdWithRevisions(id: string) {
  return prisma.note.findUnique({
    where: { id },
    include: {
      revisions: {
        select: noteRevisionSelect,
        orderBy: {
          createdAt: "desc",
        },
        take: 12,
      },
    },
  });
}

export async function findRelatedNoteCandidates(noteId: string, limit: number) {
  return prisma.note.findMany({
    where: {
      id: { not: noteId },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
    select: noteListSelect,
  });
}

export async function findNoteForEdit(id: string) {
  return prisma.note.findUnique({
    where: { id },
  });
}

export async function findRevisionForNote(noteId: string, revisionId: string) {
  return prisma.noteRevision.findFirst({
    where: {
      id: revisionId,
      noteId,
    },
    select: noteRevisionSelect,
  });
}

export async function createNoteWithRevision(input: NoteInput) {
  return prisma.$transaction(async (tx) => {
    const note = await tx.note.create({
      data: input,
    });

    await tx.noteRevision.create({
      data: buildRevisionSnapshotData(note),
    });

    return note;
  });
}

export async function updateNoteWithRevision(id: string, input: NoteInput) {
  return prisma.$transaction(async (tx) => {
    const note = await tx.note.update({
      where: { id },
      data: input,
    });

    await tx.noteRevision.create({
      data: buildRevisionSnapshotData(note),
    });

    return note;
  });
}

export async function updateReviewStateWithRevision(
  id: string,
  data: Pick<
    Note,
    "status" | "needsReview" | "reviewDueAt" | "reviewCount" | "lastReviewedAt"
  >,
) {
  return prisma.$transaction(async (tx) => {
    const note = await tx.note.update({
      where: { id },
      data,
    });

    await tx.noteRevision.create({
      data: buildRevisionSnapshotData(note),
    });

    return note;
  });
}

export async function restoreRevisionWithSnapshot(id: string, revision: NoteRevisionRecord) {
  return prisma.$transaction(async (tx) => {
    const note = await tx.note.update({
      where: { id },
      data: buildRestoredNoteData(revision),
    });

    await tx.noteRevision.create({
      data: buildRevisionSnapshotData(note),
    });

    return note;
  });
}

export async function removeNote(id: string) {
  return prisma.note.delete({
    where: { id },
  });
}

function buildRevisionSnapshotData(note: NoteSnapshotSource) {
  return {
    noteId: note.id,
    title: note.title,
    summary: note.summary,
    explanation: note.explanation,
    stuckPoints: note.stuckPoints,
    nextActions: note.nextActions,
    body: note.body,
    tags: note.tags,
    status: note.status,
    needsReview: note.needsReview,
    reviewDueAt: note.reviewDueAt,
    reviewCount: note.reviewCount,
    lastReviewedAt: note.lastReviewedAt,
  } satisfies Prisma.NoteRevisionUncheckedCreateInput;
}

function buildRestoredNoteData(revision: NoteRevisionRecord) {
  return {
    title: revision.title,
    summary: revision.summary,
    explanation: revision.explanation,
    stuckPoints: revision.stuckPoints,
    nextActions: revision.nextActions,
    body: revision.body,
    tags: revision.tags,
    status: revision.status,
    needsReview: revision.needsReview,
    reviewDueAt: revision.reviewDueAt,
    reviewCount: revision.reviewCount,
    lastReviewedAt: revision.lastReviewedAt,
  } satisfies Prisma.NoteUncheckedUpdateInput;
}
