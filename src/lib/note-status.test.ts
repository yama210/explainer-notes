import { NoteStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { getNextStatusAfterReview, getReviewTransitionGuide } from "./note-status";

describe("note status helpers", () => {
  it("moves reviewing notes to explainable after the second review", () => {
    expect(getNextStatusAfterReview(NoteStatus.DRAFT, 1)).toBe(NoteStatus.REVIEWING);
    expect(getNextStatusAfterReview(NoteStatus.REVIEWING, 2)).toBe(
      NoteStatus.EXPLAINABLE,
    );
    expect(getNextStatusAfterReview(NoteStatus.ARCHIVED, 3)).toBe(
      NoteStatus.ARCHIVED,
    );
  });

  it("returns a readable review transition guide", () => {
    expect(getReviewTransitionGuide(NoteStatus.REVIEWING, 1)).toEqual(
      expect.objectContaining({
        currentLabel: "確認中",
        nextLabel: "説明できる",
      }),
    );
  });
});
