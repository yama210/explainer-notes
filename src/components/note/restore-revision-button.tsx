"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildNoteDetailHref } from "@/lib/note-links";

type RestoreRevisionButtonProps = {
  noteId: string;
  revisionId: string;
};

export function RestoreRevisionButton({
  noteId,
  revisionId,
}: RestoreRevisionButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleRestore() {
    const confirmed = window.confirm(
      "この版の内容で現在のノートを上書きしますか？",
    );
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/notes/${noteId}/revisions/${revisionId}/restore`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error ?? "この版を復元できませんでした。");
      }

      router.push(buildNoteDetailHref(noteId, { restoredFrom: revisionId }));
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "この版を復元できませんでした。",
      );
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleRestore}
        disabled={isSubmitting}
        className="action-secondary px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "復元中..." : "この版を復元"}
      </button>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}
