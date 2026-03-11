import Link from "next/link";
import { SectionIntro } from "@/components/layout/section-intro";
import { DeleteNoteButton } from "@/components/note/delete-note-button";
import { MarkdownViewer } from "@/components/note/markdown-viewer";
import { NoteCard } from "@/components/note/note-card";
import { NoteDetailMetaItem } from "@/components/note/note-detail-meta-item";
import { NoteDetailSection } from "@/components/note/note-detail-section";
import { NoteReviewSummary } from "@/components/note/note-review-summary";
import { NoteStatusBadge } from "@/components/note/note-status-badge";
import { RelatedPresetControls } from "@/components/note/related-preset-controls";
import { ReviewCompleteButton } from "@/components/note/review-complete-button";
import { ReviewTransitionGuide } from "@/components/note/review-transition-guide";
import { formatDate, formatDateTime } from "@/lib/format";
import { buildNotesHref } from "@/lib/note-links";
import { getNoteById } from "@/lib/notes";
import { pickSearchParamValues } from "@/lib/search-params";

export const dynamic = "force-dynamic";

type NoteDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: NoteDetailPageProps) {
  const { id } = await params;
  const { note } = await getNoteById(id);

  return {
    title: note.title,
    description: note.summary || note.explanation.slice(0, 120),
  };
}

export default async function NoteDetailPage({
  params,
  searchParams,
}: NoteDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const { related } = pickSearchParamValues(query, ["related"] as const);
  const { note, relatedMatches, relatedPreset } = await getNoteById(id, related);

  return (
    <main className="space-y-16 pb-16">
      <article className="page-section space-y-12">
        <header className="space-y-8">
          <div>
            <Link
              href={buildNotesHref()}
              className="mb-6 flex w-max items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--accent)]"
            >
              ← ノート一覧に戻る
            </Link>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <NoteStatusBadge status={note.status} />
              {note.needsReview ? (
                <span className="rounded-full bg-[var(--danger-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--danger)]">
                  要復習
                </span>
              ) : null}
            </div>

            <div className="space-y-4">
              <h1 className="max-w-5xl font-heading text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
                {note.title}
              </h1>
              <p className="max-w-4xl border-l-2 border-[var(--accent)] pl-4 text-base leading-relaxed text-[var(--muted)]">
                {note.summary || "まだ要点は入力されていません。"}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {note.tags.length > 0 ? (
                note.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={buildNotesHref({ tag })}
                    className="rounded-md bg-[var(--surface-muted)] px-2 py-1 text-xs text-[var(--muted)] hover:text-[var(--accent)]"
                  >
                    #{tag}
                  </Link>
                ))
              ) : (
                <span className="text-sm text-[var(--muted)]">タグはまだありません</span>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--line-light)] bg-[var(--surface)] p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <NoteDetailMetaItem
                  label="作成日"
                  value={formatDateTime(note.createdAt)}
                />
                <NoteDetailMetaItem
                  label="更新日"
                  value={formatDateTime(note.updatedAt)}
                />
                <NoteDetailMetaItem
                  label="次回の復習日"
                  value={note.reviewDueAt ? formatDate(note.reviewDueAt) : "未設定"}
                />
                <NoteDetailMetaItem
                  label="復習回数"
                  value={`${note.reviewCount}回`}
                />
              </dl>

              <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
                {note.needsReview ? <ReviewCompleteButton noteId={note.id} /> : null}
                <Link
                  href={`/notes/${note.id}/edit`}
                  className="action-secondary px-5 py-2 text-sm"
                >
                  編集する
                </Link>
                <DeleteNoteButton noteId={note.id} noteTitle={note.title} />
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.9fr)_minmax(18rem,0.8fr)]">
          <div className="space-y-12">
            <NoteDetailSection
              title="自分の言葉での説明"
              icon="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            >
              {note.explanation || "まだ説明は入力されていません。"}
            </NoteDetailSection>

            <NoteDetailSection
              title="つまずき・疑問"
              icon="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              color="text-amber-400"
            >
              {note.stuckPoints || "まだ記録はありません。"}
            </NoteDetailSection>

            <NoteDetailSection
              title="次にやること"
              icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              color="text-emerald-400"
            >
              {note.nextActions || "まだ記録はありません。"}
            </NoteDetailSection>

            <section className="space-y-4 pt-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--foreground)]">
                本文
              </h2>
              <div className="quiet-panel min-h-[400px] px-6 py-7 sm:px-10">
                <MarkdownViewer content={note.body} />
              </div>
            </section>
          </div>

          <aside className="relative space-y-6">
            <div className="sticky top-24 space-y-6">
              <NoteReviewSummary
                lastReviewedAt={note.lastReviewedAt}
                reviewDueAt={note.reviewDueAt}
                needsReview={note.needsReview}
              />

              <ReviewTransitionGuide
                status={note.status}
                reviewCount={note.reviewCount}
              />
            </div>
          </aside>
        </section>
      </article>

      <section className="page-section space-y-8 border-t border-[var(--line-light)] pt-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <SectionIntro
            title="関連ノート"
            description="タグや説明の近さから、このノートと一緒に見返すと理解がつながりやすいノートを表示します。"
          />
          <RelatedPresetControls
            noteId={note.id}
            currentPreset={relatedPreset}
          />
        </div>

        {relatedMatches.length > 0 ? (
          <div className="grid gap-5">
            {relatedMatches.map((match) => (
              <NoteCard
                key={match.note.id}
                note={match.note}
                annotation={match.reasons.join(" / ")}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-[var(--line-light)] bg-[rgba(255,255,255,0.01)] px-5 py-6">
            <p className="max-w-lg text-center text-sm italic leading-7 text-[var(--muted)]">
              まだ関連ノートは見つかっていません。タグや要点を整えると、近いテーマのノートが表示されやすくなります。
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
