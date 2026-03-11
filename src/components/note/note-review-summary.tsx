import { formatDate, formatRelativeFromNow } from "@/lib/format";

type NoteReviewSummaryProps = {
  lastReviewedAt: Date | null;
  reviewDueAt: Date | null;
  needsReview: boolean;
};

export function NoteReviewSummary({
  lastReviewedAt,
  reviewDueAt,
  needsReview,
}: NoteReviewSummaryProps) {
  return (
    <div className="space-y-3 rounded-lg border border-[var(--line-light)] bg-[var(--surface)] p-5">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">
        復習の状況
      </h3>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--muted)]">前回の復習</dt>
          <dd className="font-medium text-[var(--foreground)]">
            {lastReviewedAt ? formatRelativeFromNow(lastReviewedAt) : "まだありません"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--muted)]">次回の復習日</dt>
          <dd className="font-medium text-[var(--foreground)]">
            {reviewDueAt ? formatDate(reviewDueAt) : "未設定"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--muted)]">要復習</dt>
          <dd
            className={`font-medium ${
              needsReview ? "text-[var(--danger)]" : "text-[var(--success)]"
            }`}
          >
            {needsReview ? "はい" : "いいえ"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
