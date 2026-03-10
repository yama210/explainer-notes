"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";

type ReviewCompleteButtonProps = {
  noteId: string;
};

type ReviewResponse = {
  id: string;
  status: string;
  statusLabel: string;
  reviewDueAt: string | null;
  intervalDays: number;
};

const REVIEW_MESSAGE_KEY = "explainer-notes:review-message";

export function ReviewCompleteButton({ noteId }: ReviewCompleteButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedMessage = sessionStorage.getItem(REVIEW_MESSAGE_KEY);
    if (!storedMessage) {
      return;
    }

    setMessage(storedMessage);
    sessionStorage.removeItem(REVIEW_MESSAGE_KEY);
  }, []);

  async function handleComplete() {
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/notes/${noteId}/review`, {
        method: "POST",
      });

      const result = (await response.json()) as Partial<ReviewResponse> & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "復習完了を記録できませんでした。");
      }

      const nextReviewDate = result.reviewDueAt
        ? formatDate(result.reviewDueAt)
        : "未設定";

      const nextMessage = `復習を記録しました。今回は ${result.intervalDays ?? 0} 日後に設定し、次回の復習日は ${nextReviewDate}、ステータスは「${result.statusLabel ?? "未設定"}」です。`;
      setMessage(nextMessage);
      sessionStorage.setItem(REVIEW_MESSAGE_KEY, nextMessage);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "復習完了を記録できませんでした。",
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
        onClick={handleComplete}
        disabled={isSubmitting}
        className="action-primary px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "記録中..." : "今日の復習を完了"}
      </button>
      {message ? (
        <p className="max-w-md rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--accent)]">
          {message}
        </p>
      ) : null}
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}
