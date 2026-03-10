import { NoteStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildDashboardStats,
  buildNoteWhere,
  buildOverdueReviewList,
  buildReviewQueue,
  getNextReviewDueAt,
  getNextReviewIntervalDays,
  getOrderBy,
  matchRelatedNotes,
  relatedNoteWeightPresets,
  resolveRelatedNoteWeights,
} from "./note-helpers";

describe("note helpers", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("builds a prisma where clause from list filters", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-08T09:00:00+09:00"));

    expect(
      buildNoteWhere({
        q: "jwt auth",
        status: NoteStatus.REVIEWING,
        tag: "auth",
        sort: "updated_desc",
        review: "overdue",
      }),
    ).toEqual({
      AND: [
        { status: NoteStatus.REVIEWING },
        { tags: { has: "auth" } },
        {
          needsReview: true,
          reviewDueAt: {
            lt: new Date("2026-03-08T00:00:00.000+09:00"),
          },
        },
        {
          OR: [
            { title: { contains: "jwt", mode: "insensitive" } },
            { summary: { contains: "jwt", mode: "insensitive" } },
            { explanation: { contains: "jwt", mode: "insensitive" } },
            { stuckPoints: { contains: "jwt", mode: "insensitive" } },
            { nextActions: { contains: "jwt", mode: "insensitive" } },
            { body: { contains: "jwt", mode: "insensitive" } },
            { tags: { has: "jwt" } },
          ],
        },
        {
          OR: [
            { title: { contains: "auth", mode: "insensitive" } },
            { summary: { contains: "auth", mode: "insensitive" } },
            { explanation: { contains: "auth", mode: "insensitive" } },
            { stuckPoints: { contains: "auth", mode: "insensitive" } },
            { nextActions: { contains: "auth", mode: "insensitive" } },
            { body: { contains: "auth", mode: "insensitive" } },
            { tags: { has: "auth" } },
          ],
        },
      ],
    });
  });

  it("returns order by values for supported sorts", () => {
    expect(getOrderBy("updated_desc")).toEqual({ updatedAt: "desc" });
    expect(getOrderBy("created_desc")).toEqual({ createdAt: "desc" });
    expect(getOrderBy("title_asc")).toEqual({ title: "asc" });
  });

  it("builds dashboard stats and review lists", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-08T09:00:00+09:00"));

    const notes = [
      {
        id: "1",
        title: "JWT",
        summary: "auth token",
        explanation: "auth explanation",
        status: NoteStatus.REVIEWING,
        updatedAt: new Date("2026-03-07T09:00:00+09:00"),
        tags: ["auth"],
        needsReview: true,
        reviewDueAt: new Date("2026-03-11T09:00:00+09:00"),
        reviewCount: 1,
        lastReviewedAt: null,
      },
      {
        id: "2",
        title: "Prisma",
        summary: "db query",
        explanation: "db explanation",
        status: NoteStatus.EXPLAINABLE,
        updatedAt: new Date("2026-02-20T09:00:00+09:00"),
        tags: ["database"],
        needsReview: false,
        reviewDueAt: null,
        reviewCount: 0,
        lastReviewedAt: null,
      },
      {
        id: "3",
        title: "Cookie",
        summary: "session auth",
        explanation: "session explanation",
        status: NoteStatus.DRAFT,
        updatedAt: new Date("2026-03-05T09:00:00+09:00"),
        tags: ["auth"],
        needsReview: true,
        reviewDueAt: new Date("2026-03-07T09:00:00+09:00"),
        reviewCount: 2,
        lastReviewedAt: null,
      },
    ];

    const stats = buildDashboardStats(notes);
    const queue = buildReviewQueue(notes, 2);
    const overdue = buildOverdueReviewList(notes, 2);

    expect(stats.total).toBe(3);
    expect(stats.needsReview).toBe(2);
    expect(stats.overdue).toBe(1);
    expect(stats.explainable).toBe(1);
    expect(stats.weeklyThemes).toEqual([{ tag: "auth", count: 2 }]);
    expect(queue.map((note) => note.id)).toEqual(["3", "1"]);
    expect(overdue.map((note) => note.id)).toEqual(["3"]);
  });

  it("builds related note reasons and supports weight presets", () => {
    const note = {
      title: "JWT の仕組み",
      summary: "auth token の流れ",
      explanation: "署名の確認とペイロードの読み方を説明する",
      tags: ["auth", "security"],
      status: NoteStatus.REVIEWING,
    };

    const candidates = [
      {
        id: "tag-heavy",
        title: "認証メモ",
        summary: "短いまとめ",
        explanation: "auth の一般論",
        body: "",
        tags: ["auth", "security"],
        status: NoteStatus.DRAFT,
        updatedAt: new Date("2026-03-10T09:00:00+09:00"),
        createdAt: new Date("2026-03-09T09:00:00+09:00"),
        needsReview: false,
        reviewDueAt: null,
        reviewCount: 0,
        lastReviewedAt: null,
      },
      {
        id: "concept-heavy",
        title: "JWT の署名を説明する",
        summary: "auth token の検証",
        explanation: "署名とペイロードの関係を説明する",
        body: "",
        tags: ["backend"],
        status: NoteStatus.REVIEWING,
        updatedAt: new Date("2026-03-11T09:00:00+09:00"),
        createdAt: new Date("2026-03-10T09:00:00+09:00"),
        needsReview: false,
        reviewDueAt: null,
        reviewCount: 0,
        lastReviewedAt: null,
      },
    ];

    const tagFocused = matchRelatedNotes(
      note,
      candidates,
      2,
      relatedNoteWeightPresets.tag_focused,
    );
    const conceptFocused = matchRelatedNotes(
      note,
      candidates,
      2,
      relatedNoteWeightPresets.concept_focused,
    );

    expect(tagFocused.map((candidate) => candidate.note.id)).toEqual([
      "tag-heavy",
      "concept-heavy",
    ]);
    expect(conceptFocused.map((candidate) => candidate.note.id)).toEqual([
      "concept-heavy",
      "tag-heavy",
    ]);
    expect(tagFocused[0]?.reasons[0]).toContain("共通タグ");
    expect(resolveRelatedNoteWeights("balanced", { tagWeight: 8 }).tagWeight).toBe(8);
  });

  it("calculates the next review date from the review count", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-08T09:00:00+09:00"));

    expect(getNextReviewIntervalDays(0)).toBe(1);
    expect(getNextReviewIntervalDays(1)).toBe(3);
    expect(getNextReviewDueAt(0)).toEqual(new Date("2026-03-09T00:00:00+09:00"));
    expect(getNextReviewDueAt(2)).toEqual(new Date("2026-03-15T00:00:00+09:00"));
  });
});
