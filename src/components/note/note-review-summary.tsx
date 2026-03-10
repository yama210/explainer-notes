import { formatDateTime, formatRelativeFromNow } from "@/lib/format";

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
    <div className="quiet-panel px-5 py-5 sm:px-6">
      <h2 className="text-sm font-medium text-[var(--muted)]">復習の進み方</h2>
      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[var(--muted)]">最後に復習した日</span>
          <span>{lastReviewedAt ? formatDateTime(lastReviewedAt) : "未記録"}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[var(--muted)]">次回復習まで</span>
          <span>{reviewDueAt ? formatRelativeFromNow(reviewDueAt) : "未設定"}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[var(--muted)]">現在の状態</span>
          <span>{needsReview ? "復習を続ける" : "いったん完了"}</span>
        </div>
      </div>
    </div>
  );
}
