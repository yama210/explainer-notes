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
    <div className="quiet-panel px-5 py-5 sm:px-6">
      <h2 className="text-sm font-medium text-[var(--muted)]">復習ルール</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
        今のステータスは「{guide.currentLabel}」です。次の復習完了では
        「{guide.nextLabel}」へ進む想定です。
      </p>
      <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--foreground)]">
        {guide.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ul>
    </div>
  );
}
