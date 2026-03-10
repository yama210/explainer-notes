import type { ReactNode } from "react";
import Link from "next/link";
import { SectionIntro } from "@/components/layout/section-intro";
import { DeleteNoteButton } from "@/components/note/delete-note-button";
import { MarkdownViewer } from "@/components/note/markdown-viewer";
import { NoteCard } from "@/components/note/note-card";
import { NoteReviewSummary } from "@/components/note/note-review-summary";
import { NoteStatusBadge } from "@/components/note/note-status-badge";
import { RelatedPresetControls } from "@/components/note/related-preset-controls";
import { RevisionHistoryPanel } from "@/components/note/revision-history-panel";
import { ReviewCompleteButton } from "@/components/note/review-complete-button";
import { ReviewTransitionGuide } from "@/components/note/review-transition-guide";
import { formatDate, formatDateTime } from "@/lib/format";
import { buildNotesHref } from "@/lib/note-links";
import { getNoteById } from "@/lib/notes";

export const dynamic = "force-dynamic";

type NoteDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
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
  const revisionId = getSingleQueryValue(query.revision);
  const related = getSingleQueryValue(query.related);
  const restoredFrom = getSingleQueryValue(query.restoredFrom);
  const { note, relatedMatches, relatedPreset, selectedRevision, revisionDiff } =
    await getNoteById(id, revisionId, related);

  return (
    <main className="space-y-14 pb-12">
      <article className="page-section space-y-10">
        <header className="space-y-6">
          <Link href={buildNotesHref()} className="text-sm text-[var(--accent)]">
            ノート一覧へ戻る
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <NoteStatusBadge status={note.status} />
            {note.needsReview ? (
              <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] text-[var(--muted)]">
                復習対象
              </span>
            ) : null}
          </div>

          <div className="space-y-4">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-[2.8rem]">
              {note.title}
            </h1>
            <p className="max-w-3xl text-base leading-9 text-[var(--muted)]">
              {note.summary || "まだ要点は入力されていません。"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {note.tags.length > 0 ? (
              note.tags.map((tag) => (
                <Link
                  key={tag}
                  href={buildNotesHref({ tag })}
                  className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-sm text-[var(--muted)] transition hover:text-[var(--accent)]"
                >
                  #{tag}
                </Link>
              ))
            ) : (
              <span className="text-sm text-[var(--muted)]">タグなし</span>
            )}
          </div>

          <div className="quiet-rule pt-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <dl className="grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
                <MetaItem label="作成日" value={formatDateTime(note.createdAt)} />
                <MetaItem label="更新日" value={formatDateTime(note.updatedAt)} />
                <MetaItem
                  label="復習予定日"
                  value={note.reviewDueAt ? formatDate(note.reviewDueAt) : "未設定"}
                />
                <MetaItem label="復習回数" value={`${note.reviewCount}回`} />
              </dl>

              <div className="flex flex-wrap gap-3">
                {note.needsReview ? <ReviewCompleteButton noteId={note.id} /> : null}
                <Link href={`/notes/${note.id}/edit`} className="action-secondary px-5 py-3">
                  編集する
                </Link>
                <DeleteNoteButton noteId={note.id} noteTitle={note.title} />
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-9">
            <DetailSection title="説明">
              {note.explanation || "まだ説明は入力されていません。"}
            </DetailSection>
            <DetailSection title="つまずき・疑問">
              {note.stuckPoints || "まだメモはありません。"}
            </DetailSection>
            <DetailSection title="次にやること">
              {note.nextActions || "まだメモはありません。"}
            </DetailSection>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">本文</h2>
              <div className="quiet-panel px-5 py-6 sm:px-7">
                <MarkdownViewer content={note.body} />
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <NoteReviewSummary
              lastReviewedAt={note.lastReviewedAt}
              reviewDueAt={note.reviewDueAt}
              needsReview={note.needsReview}
            />

            <ReviewTransitionGuide status={note.status} reviewCount={note.reviewCount} />

            <RevisionHistoryPanel
              noteId={note.id}
              revisions={note.revisions}
              selectedRevision={selectedRevision}
              revisionDiff={revisionDiff}
              relatedPreset={relatedPreset}
              restoredFrom={restoredFrom}
            />
          </aside>
        </section>
      </article>

      <section className="page-section space-y-5">
        <SectionIntro
          title="関連ノート"
          description="タグだけでなく、要点と説明文の近さも使って関連ノートを並べています。"
          action={
            <RelatedPresetControls
              noteId={note.id}
              currentPreset={relatedPreset}
              revisionId={selectedRevision?.id}
              restoredFrom={restoredFrom}
            />
          }
        />

        {relatedMatches.length > 0 ? (
          <div className="space-y-4">
            {relatedMatches.map((match) => (
              <NoteCard
                key={match.note.id}
                note={match.note}
                annotation={match.reasons.join(" / ")}
              />
            ))}
          </div>
        ) : (
          <div className="quiet-panel px-5 py-6 text-sm leading-7 text-[var(--muted)]">
            まだ関連ノートはありません。タグや要点を書き足すと、近い内容のノートが
            見つかりやすくなります。
          </div>
        )}
      </section>
    </main>
  );
}

type DetailSectionProps = {
  title: string;
  children: ReactNode;
};

function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
      <div className="max-w-3xl whitespace-pre-wrap text-[15px] leading-9 text-[var(--foreground)]">
        {children}
      </div>
    </section>
  );
}

type MetaItemProps = {
  label: string;
  value: string;
};

function MetaItem({ label, value }: MetaItemProps) {
  return (
    <div>
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

function getSingleQueryValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
