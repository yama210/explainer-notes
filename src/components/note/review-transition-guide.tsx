import { NoteStatus } from "@prisma/client";
import { getReviewTransitionGuide } from "@/lib/note-status";

type ReviewTransitionGuideProps = {
  status: NoteStatus;
  reviewCount: number;
};

export function ReviewTransitionGuide({
  status,
  reviewCount,
}: ReviewTransitionGuideProps) {
  const guide = getReviewTransitionGuide(status, reviewCount);

  return (
    <div className="space-y-3 rounded-lg border border-[var(--line-light)] bg-[var(--surface)] p-5">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">
        復習ルール
      </h3>
      <p className="text-sm text-[var(--muted)]">
        現在のステータスは「
        {guide.currentLabel}
        」です。次の復習完了後は「
        {guide.nextLabel}
        」になります。復習回数は {reviewCount} 回です。
      </p>
      <ol className="list-decimal space-y-1 pl-4 text-sm text-[var(--muted)]">
        {guide.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}
