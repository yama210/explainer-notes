import { act, fireEvent, render, screen } from "@testing-library/react";
import { NoteStatus } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emptyNoteFormValues } from "@/lib/note-form-values";
import { NoteForm } from "./note-form";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
    back: vi.fn(),
  }),
}));

describe("NoteForm", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders a split markdown preview and updates it as the user types", () => {
    render(
      <NoteForm
        mode="create"
        initialValues={{
          ...emptyNoteFormValues,
          needsReview: false,
        }}
      />,
    );

    expect(screen.getByText("プレビュー")).toBeInTheDocument();
    expect(screen.getByText("まだ本文は入力されていません。")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/## 要点/), {
      target: {
        value: "## JWT\n\n- token\n\n```ts\nconsole.log('preview');\n```",
      },
    });

    expect(screen.getByRole("heading", { name: "JWT" })).toBeInTheDocument();
    expect(screen.getByText("token")).toBeInTheDocument();
    expect(screen.getByText("console.log('preview');")).toBeInTheDocument();
  });

  it("inserts markdown snippets from the toolbar", () => {
    render(
      <NoteForm
        mode="create"
        initialValues={{
          ...emptyNoteFormValues,
          needsReview: false,
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "insert-code" }));

    expect(screen.getByDisplayValue(/console\.log\('code'\);/)).toBeInTheDocument();
  });

  it("autosaves edits in edit mode", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "note-1" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <NoteForm
        mode="edit"
        noteId="note-1"
        initialValues={{
          title: "JWT",
          summary: "old summary",
          explanation: "explanation",
          stuckPoints: "",
          nextActions: "",
          body: "",
          tagsText: "auth",
          status: NoteStatus.REVIEWING,
          needsReview: true,
          reviewDueAt: "2026-03-20",
        }}
      />,
    );

    await act(async () => {
      fireEvent.change(screen.getByDisplayValue("old summary"), {
        target: {
          value: "updated summary",
        },
      });

      await vi.advanceTimersByTimeAsync(1300);
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/notes/note-1",
      expect.objectContaining({
        method: "PATCH",
      }),
    );

    expect(refresh).toHaveBeenCalled();
    expect(screen.getByTestId("autosave-state")).toHaveTextContent("自動保存済み");
  });
});
