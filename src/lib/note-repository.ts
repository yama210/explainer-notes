import { NoteStatus, Prisma } from "@prisma/client";
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

export type NoteListRecord = Prisma.NoteGetPayload<{
  select: typeof noteListSelect;
}>;

export type DashboardStatRecord = Prisma.NoteGetPayload<{
  select: typeof dashboardStatSelect;
}>;

export type NoteDetailRecord = Prisma.NoteGetPayload<{
  select: typeof noteListSelect & {
    stuckPoints: true;
    nextActions: true;
  };
}>;

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

export async function findNoteById(id: string) {
  return prisma.note.findUnique({
    where: { id },
    select: {
      ...noteListSelect,
      stuckPoints: true,
      nextActions: true,
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

export async function createNoteRecord(input: NoteInput) {
  return prisma.note.create({
    data: input,
  });
}

export async function updateNoteRecord(id: string, input: NoteInput) {
  return prisma.note.update({
    where: { id },
    data: input,
  });
}

export async function updateReviewState(
  id: string,
  data: {
    status: Prisma.EnumNoteStatusFieldUpdateOperationsInput | NoteStatus;
    needsReview: boolean;
    reviewDueAt: Date;
    reviewCount: number;
    lastReviewedAt: Date;
  },
) {
  return prisma.note.update({
    where: { id },
    data,
  });
}

export async function removeNote(id: string) {
  return prisma.note.delete({
    where: { id },
  });
}
