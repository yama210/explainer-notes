import { NoteStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { noteInputSchema, parseTagInput } from "./validation";

describe("parseTagInput", () => {
  it("splits comma separated tags and trims whitespace", () => {
    expect(parseTagInput(" auth, web ,security  , ")).toEqual([
      "auth",
      "web",
      "security",
    ]);
  });
});

describe("noteInputSchema", () => {
  it("normalizes tags and review date", () => {
    const parsed = noteInputSchema.parse({
      title: "JWT",
      summary: "summary",
      explanation: "explanation",
      stuckPoints: "",
      nextActions: "",
      body: "## body",
      tags: [" Auth ", "web", "auth"],
      status: NoteStatus.REVIEWING,
      needsReview: true,
      reviewDueAt: "2026-03-20",
    });

    expect(parsed.tags).toEqual(["auth", "web"]);
    expect(parsed.reviewDueAt).toBeInstanceOf(Date);
    expect(parsed.reviewDueAt?.getFullYear()).toBe(2026);
    expect(parsed.reviewDueAt?.getMonth()).toBe(2);
    expect(parsed.reviewDueAt?.getDate()).toBe(20);
  });

  it("accepts ISO date strings sent from the API client", () => {
    const parsed = noteInputSchema.parse({
      title: "JWT",
      summary: "summary",
      explanation: "explanation",
      stuckPoints: "",
      nextActions: "",
      body: "## body",
      tags: ["Auth"],
      status: NoteStatus.REVIEWING,
      needsReview: true,
      reviewDueAt: "2026-03-20T00:00:00.000Z",
    });

    expect(parsed.reviewDueAt).toBeInstanceOf(Date);
    expect(parsed.reviewDueAt?.getFullYear()).toBe(2026);
    expect(parsed.reviewDueAt?.getMonth()).toBe(2);
    expect(parsed.reviewDueAt?.getDate()).toBe(20);
  });

  it("rejects missing reviewDueAt when needsReview is true", () => {
    const parsed = noteInputSchema.safeParse({
      title: "JWT",
      summary: "",
      explanation: "",
      stuckPoints: "",
      nextActions: "",
      body: "",
      tags: [],
      status: NoteStatus.DRAFT,
      needsReview: true,
      reviewDueAt: null,
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.reviewDueAt).toContain(
        "要復習にする場合は復習予定日を入力してください。",
      );
    }
  });

  it("rejects review dates before today", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yyyy = yesterday.getFullYear();
    const mm = String(yesterday.getMonth() + 1).padStart(2, "0");
    const dd = String(yesterday.getDate()).padStart(2, "0");

    const parsed = noteInputSchema.safeParse({
      title: "JWT",
      summary: "",
      explanation: "",
      stuckPoints: "",
      nextActions: "",
      body: "",
      tags: [],
      status: NoteStatus.DRAFT,
      needsReview: true,
      reviewDueAt: `${yyyy}-${mm}-${dd}`,
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.reviewDueAt).toContain(
        "復習予定日は今日以降の日付を入力してください。",
      );
    }
  });
});
