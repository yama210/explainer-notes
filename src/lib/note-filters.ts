import { NoteStatus, Prisma } from "@prisma/client";
import type { DashboardStatRecord } from "./note-repository";
import { createReviewDateFromLocalParts } from "./review-date";
import type { NoteListQuery } from "./validation";

export type NoteStats = {
  total: number;
  needsReview: number;
  overdue: number;
  explainable: number;
  statusCounts: Array<{ status: NoteStatus; count: number }>;
  topTags: Array<{ tag: string; count: number }>;
  weeklyThemes: Array<{ tag: string; count: number }>;
};

export function startOfToday(base = new Date()) {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate());
}

export function buildNoteWhere(filters: NoteListQuery): Prisma.NoteWhereInput {
  const conditions: Prisma.NoteWhereInput[] = [];
  const terms = filters.q
    .split(/\s+/)
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);

  if (filters.status !== "ALL") {
    conditions.push({
      status: filters.status,
    });
  }

  if (filters.tag) {
    conditions.push({
      tags: {
        has: filters.tag.toLowerCase(),
      },
    });
  }

  const today = startOfToday();

  if (filters.review === "needs_review") {
    conditions.push({
      needsReview: true,
    });
  }

  if (filters.review === "due_soon") {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    conditions.push({
      needsReview: true,
      reviewDueAt: {
        gte: today,
        lt: nextWeek,
      },
    });
  }

  if (filters.review === "overdue") {
    conditions.push({
      needsReview: true,
      reviewDueAt: {
        lt: today,
      },
    });
  }

  for (const term of terms) {
    conditions.push({
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { summary: { contains: term, mode: "insensitive" } },
        { explanation: { contains: term, mode: "insensitive" } },
        { stuckPoints: { contains: term, mode: "insensitive" } },
        { nextActions: { contains: term, mode: "insensitive" } },
        { body: { contains: term, mode: "insensitive" } },
        { tags: { has: term } },
      ],
    });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

export function getOrderBy(
  sort: NoteListQuery["sort"],
): Prisma.NoteOrderByWithRelationInput {
  switch (sort) {
    case "created_desc":
      return { createdAt: "desc" };
    case "title_asc":
      return { title: "asc" };
    case "updated_desc":
    default:
      return { updatedAt: "desc" };
  }
}

export function collectTopTags(notes: Array<{ tags: string[] }>) {
  const counts = new Map<string, number>();

  for (const note of notes) {
    for (const tag of note.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag, count]) => ({ tag, count }));
}

export function buildDashboardStats(notes: DashboardStatRecord[]): NoteStats {
  const today = startOfToday();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const statusCounts = Object.values(NoteStatus).map((status) => ({
    status,
    count: notes.filter((note) => note.status === status).length,
  }));

  const updatedThisWeekNotes = notes.filter((note) => note.updatedAt >= sevenDaysAgo);

  return {
    total: notes.length,
    needsReview: notes.filter((note) => note.needsReview).length,
    overdue: notes.filter((note) => isOverdue(note.reviewDueAt, note.needsReview)).length,
    explainable: notes.filter((note) => note.status === NoteStatus.EXPLAINABLE).length,
    statusCounts,
    topTags: collectTopTags(notes).slice(0, 6),
    weeklyThemes: collectTopTags(updatedThisWeekNotes).slice(0, 4),
  };
}

export function buildReviewQueue<T extends DashboardStatRecord>(notes: T[], limit: number) {
  return sortNotesByReviewDate(notes)
    .filter((note) => note.needsReview && note.reviewDueAt)
    .slice(0, limit);
}

export function buildOverdueReviewList<T extends DashboardStatRecord>(
  notes: T[],
  limit: number,
) {
  return sortNotesByReviewDate(notes)
    .filter((note) => isOverdue(note.reviewDueAt, note.needsReview))
    .slice(0, limit);
}

export function getNextReviewIntervalDays(reviewCount: number) {
  const intervals = [1, 3, 7, 14, 30];
  return intervals[Math.min(reviewCount, intervals.length - 1)];
}

export function getNextReviewDueAt(reviewCount: number, baseDate = new Date()) {
  const nextDate = createReviewDateFromLocalParts(baseDate);
  nextDate.setUTCDate(nextDate.getUTCDate() + getNextReviewIntervalDays(reviewCount));
  return nextDate;
}

function sortNotesByReviewDate<T extends Pick<DashboardStatRecord, "reviewDueAt">>(notes: T[]) {
  return [...notes].sort((a, b) => {
    const timeA = a.reviewDueAt?.getTime() ?? Number.POSITIVE_INFINITY;
    const timeB = b.reviewDueAt?.getTime() ?? Number.POSITIVE_INFINITY;
    return timeA - timeB;
  });
}

function isOverdue(reviewDueAt: Date | null, needsReview: boolean) {
  if (!needsReview || !reviewDueAt) {
    return false;
  }

  return reviewDueAt < startOfToday();
}
