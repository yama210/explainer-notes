"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteNoteButtonProps = {
  noteId: string;
  noteTitle: string;
};

export function DeleteNoteButton({
  noteId,
  noteTitle,
}: DeleteNoteButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `「${noteTitle}」を削除しますか？この操作は元に戻せません。`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("ノートを削除できませんでした。");
      }

      router.push("/notes");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "ノートを削除できませんでした。",
      );
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="rounded-full bg-[var(--danger-soft)] px-4 py-2.5 text-sm text-[var(--danger)] transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? "削除中..." : "削除する"}
      </button>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}
