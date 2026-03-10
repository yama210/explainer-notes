import { beforeEach, describe, expect, it, vi } from "vitest";
import { NoteStatus } from "@prisma/client";
import type { NoteInput } from "./validation";

const { repositoryMock, notFoundMock } = vi.hoisted(() => ({
  repositoryMock: {
    countNotes: vi.fn(),
    createNoteWithRevision: vi.fn(),
    findAllNoteTags: vi.fn(),
    findDashboardStatsNotes: vi.fn(),
    findNoteByIdWithRevisions: vi.fn(),
    findNoteForEdit: vi.fn(),
    findNotesForList: vi.fn(),
    findNotesForStats: vi.fn(),
    findRecentNotes: vi.fn(),
    findRelatedNoteCandidates: vi.fn(),
    findRevisionForNote: vi.fn(),
    findTodayReviewNotes: vi.fn(),
    removeNote: vi.fn(),
    restoreRevisionWithSnapshot: vi.fn(),
    updateNoteWithRevision: vi.fn(),
    updateReviewStateWithRevision: vi.fn(),
  },
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("./note-repository", () => repositoryMock);

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

import {
  completeReview,
  createNote,
  deleteNote,
  getDashboardData,
  getNoteById,
  getNoteForEdit,
  listNotes,
  restoreRevision,
  updateNote,
} from "./notes";

const sampleInput: NoteInput = {
  title: "JWT",
  summary: "summary",
  explanation: "explanation",
  stuckPoints: "stuck",
  nextActions: "next",
  body: "## body",
  tags: ["auth", "web"],
  status: NoteStatus.REVIEWING,
  needsReview: true,
  reviewDueAt: new Date("2026-03-20T00:00:00Z"),
};

describe("notes service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("returns notes, tags and stats from the repository layer", async () => {
    repositoryMock.findNotesForList.mockResolvedValue([
      {
        id: "1",
        title: "JWT",
        summary: "summary",
        explanation: "explanation",
        body: "body",
        tags: ["auth", "web"],
        status: NoteStatus.REVIEWING,
        updatedAt: new Date("2026-03-07T09:00:00+09:00"),
        createdAt: new Date("2026-03-01T09:00:00+09:00"),
        needsReview: true,
        reviewDueAt: new Date("2026-03-10T09:00:00+09:00"),
        reviewCount: 1,
        lastReviewedAt: null,
      },
    ]);
    repositoryMock.countNotes.mockResolvedValue(1);
    repositoryMock.findAllNoteTags.mockResolvedValue([
      { tags: ["auth", "web"] },
      { tags: ["auth"] },
    ]);
    repositoryMock.findNotesForStats.mockResolvedValue([
      {
        id: "1",
        title: "JWT",
        summary: "summary",
        explanation: "explanation",
        status: NoteStatus.REVIEWING,
        updatedAt: new Date("2026-03-07T09:00:00+09:00"),
        tags: ["auth", "web"],
        needsReview: true,
        reviewDueAt: new Date("2026-03-10T09:00:00+09:00"),
        reviewCount: 1,
        lastReviewedAt: null,
      },
    ]);

    const result = await listNotes({
      q: "jwt",
      status: "ALL",
      tag: "",
      sort: "updated_desc",
      review: "all",
    });

    expect(result.total).toBe(1);
    expect(result.availableTags).toEqual([
      { tag: "auth", count: 2 },
      { tag: "web", count: 1 },
    ]);
  });

  it("creates a note and stores a revision snapshot", async () => {
    repositoryMock.createNoteWithRevision.mockResolvedValue({
      id: "note-1",
      ...sampleInput,
      reviewCount: 0,
      lastReviewedAt: null,
    });

    const result = await createNote(sampleInput);

    expect(repositoryMock.createNoteWithRevision).toHaveBeenCalledWith(sampleInput);
    expect(result.id).toBe("note-1");
  });

  it("updates a note and stores a revision snapshot", async () => {
    repositoryMock.updateNoteWithRevision.mockResolvedValue({
      id: "note-1",
      ...sampleInput,
      title: "JWT updated",
      reviewCount: 1,
      lastReviewedAt: null,
    });

    const result = await updateNote("note-1", sampleInput);

    expect(repositoryMock.updateNoteWithRevision).toHaveBeenCalledWith("note-1", sampleInput);
    expect(result.title).toBe("JWT updated");
  });

  it("builds dashboard data from repository responses", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 11, 9, 0, 0));

    repositoryMock.findRecentNotes.mockResolvedValue([
      {
        id: "1",
        title: "JWT",
        summary: "summary",
        explanation: "explanation",
        body: "body",
        tags: ["auth"],
        status: NoteStatus.EXPLAINABLE,
        updatedAt: new Date("2026-03-07T09:00:00+09:00"),
        createdAt: new Date("2026-03-01T09:00:00+09:00"),
        needsReview: false,
        reviewDueAt: null,
        reviewCount: 0,
        lastReviewedAt: null,
      },
    ]);
    repositoryMock.findTodayReviewNotes.mockResolvedValue([
      {
        id: "3",
        title: "今日復習する JWT ノート",
        summary: "summary",
        explanation: "explanation",
        body: "body",
        tags: ["auth"],
        status: NoteStatus.REVIEWING,
        updatedAt: new Date("2026-03-11T08:00:00+09:00"),
        createdAt: new Date("2026-03-10T09:00:00+09:00"),
        needsReview: true,
        reviewDueAt: new Date("2026-03-11T00:00:00+09:00"),
        reviewCount: 1,
        lastReviewedAt: null,
      },
    ]);
    repositoryMock.findDashboardStatsNotes.mockResolvedValue([
      {
        id: "1",
        title: "A",
        summary: "summary",
        explanation: "explanation",
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
        title: "B",
        summary: "summary",
        explanation: "explanation",
        status: NoteStatus.DRAFT,
        updatedAt: new Date("2026-03-06T09:00:00+09:00"),
        tags: ["web"],
        needsReview: true,
        reviewDueAt: new Date("2026-03-07T09:00:00+09:00"),
        reviewCount: 2,
        lastReviewedAt: null,
      },
    ]);

    const result = await getDashboardData();

    expect(result.todayReviewNotes.map((note) => note.id)).toEqual(["3"]);
    expect(result.overdueNotes.map((note) => note.id)).toEqual(["2"]);
  });

  it("returns note detail with related note reasons", async () => {
    repositoryMock.findNoteByIdWithRevisions.mockResolvedValue({
      id: "note-1",
      title: "JWT",
      summary: "auth token",
      explanation: "認証の流れを説明する",
      stuckPoints: "stuck",
      nextActions: "next",
      body: "body",
      tags: ["auth"],
      status: NoteStatus.REVIEWING,
      needsReview: true,
      reviewDueAt: null,
      reviewCount: 1,
      lastReviewedAt: null,
      createdAt: new Date("2026-03-01T09:00:00+09:00"),
      updatedAt: new Date("2026-03-07T09:00:00+09:00"),
      revisions: [
        {
          id: "rev-1",
          title: "JWT",
          summary: "auth token",
          explanation: "認証の流れを説明する",
          stuckPoints: "stuck",
          nextActions: "next",
          body: "body",
          tags: ["auth"],
          status: NoteStatus.REVIEWING,
          needsReview: true,
          reviewDueAt: null,
          reviewCount: 1,
          lastReviewedAt: null,
          createdAt: new Date("2026-03-07T09:00:00+09:00"),
        },
      ],
    });
    repositoryMock.findRelatedNoteCandidates.mockResolvedValue([
      {
        id: "candidate-1",
        title: "JWT 認証の流れ",
        summary: "auth summary",
        explanation: "認証の説明",
        body: "body",
        tags: ["auth", "security"],
        status: NoteStatus.REVIEWING,
        updatedAt: new Date("2026-03-08T09:00:00+09:00"),
        createdAt: new Date("2026-03-07T09:00:00+09:00"),
        needsReview: false,
        reviewDueAt: null,
        reviewCount: 0,
        lastReviewedAt: null,
      },
    ]);

    const result = await getNoteById("note-1", undefined, "tag_focused");

    expect(result.relatedPreset).toBe("tag_focused");
    expect(result.relatedMatches[0]?.reasons[0]).toContain("共通タグ");
    expect(result.relatedMatches.map((match) => match.note.id)).toEqual(["candidate-1"]);
  });

  it("completes review, updates status and returns interval metadata", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 11, 9, 0, 0));

    repositoryMock.findNoteForEdit.mockResolvedValue({
      id: "note-1",
      title: "JWT",
      summary: "summary",
      explanation: "explanation",
      stuckPoints: "stuck",
      nextActions: "next",
      body: "body",
      tags: ["auth"],
      status: NoteStatus.REVIEWING,
      needsReview: true,
      reviewDueAt: new Date("2026-03-11T00:00:00+09:00"),
      reviewCount: 1,
      lastReviewedAt: null,
      createdAt: new Date("2026-03-01T09:00:00+09:00"),
      updatedAt: new Date("2026-03-07T09:00:00+09:00"),
    });
    repositoryMock.updateReviewStateWithRevision.mockResolvedValue({
      id: "note-1",
      title: "JWT",
      summary: "summary",
      explanation: "explanation",
      stuckPoints: "stuck",
      nextActions: "next",
      body: "body",
      tags: ["auth"],
      status: NoteStatus.EXPLAINABLE,
      needsReview: true,
      reviewDueAt: new Date("2026-03-14T00:00:00+09:00"),
      reviewCount: 2,
      lastReviewedAt: new Date("2026-03-11T09:00:00+09:00"),
      createdAt: new Date("2026-03-01T09:00:00+09:00"),
      updatedAt: new Date("2026-03-11T09:00:00+09:00"),
    });

    const result = await completeReview("note-1");

    expect(repositoryMock.updateReviewStateWithRevision).toHaveBeenCalledWith(
      "note-1",
      expect.objectContaining({
        status: NoteStatus.EXPLAINABLE,
        reviewCount: 2,
        reviewDueAt: new Date(2026, 2, 14, 0, 0, 0),
      }),
    );
    expect(result.intervalDays).toBe(3);
    expect(result.note.status).toBe(NoteStatus.EXPLAINABLE);
  });

  it("restores a revision and stores a new snapshot", async () => {
    repositoryMock.findRevisionForNote.mockResolvedValue({
      id: "rev-1",
      title: "old",
      summary: "summary",
      explanation: "explanation",
      stuckPoints: "stuck",
      nextActions: "next",
      body: "body",
      tags: ["auth"],
      status: NoteStatus.DRAFT,
      needsReview: true,
      reviewDueAt: null,
      reviewCount: 0,
      lastReviewedAt: null,
      createdAt: new Date("2026-03-01T09:00:00+09:00"),
    });
    repositoryMock.restoreRevisionWithSnapshot.mockResolvedValue({
      id: "note-1",
      title: "old",
      summary: "summary",
      explanation: "explanation",
      stuckPoints: "stuck",
      nextActions: "next",
      body: "body",
      tags: ["auth"],
      status: NoteStatus.DRAFT,
      needsReview: true,
      reviewDueAt: null,
      reviewCount: 0,
      lastReviewedAt: null,
      createdAt: new Date("2026-03-01T09:00:00+09:00"),
      updatedAt: new Date("2026-03-12T09:00:00+09:00"),
    });

    const result = await restoreRevision("note-1", "rev-1");

    expect(repositoryMock.restoreRevisionWithSnapshot).toHaveBeenCalledWith(
      "note-1",
      expect.objectContaining({
        id: "rev-1",
      }),
    );
    expect(result.title).toBe("old");
  });

  it("calls notFound when a note is missing", async () => {
    repositoryMock.findNoteByIdWithRevisions.mockResolvedValue(null);

    await expect(getNoteById("missing")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("calls notFound when edit target is missing", async () => {
    repositoryMock.findNoteForEdit.mockResolvedValue(null);

    await expect(getNoteForEdit("missing")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("delegates deletion to the repository", async () => {
    repositoryMock.removeNote.mockResolvedValue({ id: "note-1" });

    await deleteNote("note-1");

    expect(repositoryMock.removeNote).toHaveBeenCalledWith("note-1");
  });
});
