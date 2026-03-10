import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { SectionIntro } from "@/components/layout/section-intro";
import { EmptyState } from "@/components/empty-state";
import { NoteCard } from "@/components/note/note-card";
import { buildNotesHref } from "@/lib/note-links";
import { getDashboardData } from "@/lib/notes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { recentNotes, todayReviewNotes, overdueNotes, reviewQueue, stats } =
    await getDashboardData();

  return (
    <main className="space-y-14 pb-12">
      <PageIntro
        eyebrow="Explainer Notes"
        title="理解を自分の言葉に変える、静かな学習ノート"
        description="学んだ内容をただ残すのではなく、要点・説明・つまずき・次にやることへ分けて整理するためのノートアプリです。今日復習することと最近触った内容がすぐ分かるように整えています。"
        actions={
          <>
            <Link
              href={buildNotesHref({ review: "needs_review" })}
              className="action-primary px-5 py-3"
            >
              復習するノートを見る
            </Link>
            <Link href="/notes/new" className="action-secondary px-5 py-3">
              新しくノートを書く
            </Link>
          </>
        }
      />

      <section className="page-section space-y-5">
        <SectionIntro
          title="今日やること"
          description="まず着手しやすいものを、復習・期限切れ・到達状況の3つに絞って確認できます。"
          action={
            <Link href={buildNotesHref()} className="text-sm text-[var(--accent)]">
              ノート一覧へ
            </Link>
          }
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <FocusCard
            href={buildNotesHref({ review: "due_soon" })}
            label="今日復習する"
            value={`${todayReviewNotes.length}件`}
            description={
              todayReviewNotes.length > 0
                ? "復習日が今日のノートです。短いものから見直していけます。"
                : "今日が復習日のノートはありません。次の予定を見ておくと進めやすくなります。"
            }
          />
          <FocusCard
            href={buildNotesHref({ review: "overdue" })}
            label="期限切れ"
            value={`${overdueNotes.length}件`}
            description="後回しになっている復習です。ここから順に片付けると停滞が減ります。"
          />
          <FocusCard
            href={buildNotesHref({ status: "EXPLAINABLE" })}
            label="説明できる"
            value={`${stats.explainable}件`}
            description={
              reviewQueue.length > 0
                ? `次に近い復習予定は「${reviewQueue[0]?.title ?? "未設定"}」です。`
                : "説明できる段階まで育ったノートを一覧で見返せます。"
            }
          />
        </div>
      </section>

      <section className="page-section space-y-5">
        <SectionIntro
          title="今日復習するノート"
          description="今日が復習日のノートだけを並べています。学習を再開する入口として使えます。"
          action={
            <Link
              href={buildNotesHref({ review: "due_soon" })}
              className="text-sm text-[var(--accent)]"
            >
              復習一覧へ
            </Link>
          }
        />

        {todayReviewNotes.length > 0 ? (
          <div className="space-y-4">
            {todayReviewNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <div className="quiet-panel px-6 py-8 sm:px-8">
            <p className="text-sm leading-7 text-[var(--muted)]">
              今日が復習日のノートはありません。次に見るなら、期限が近い復習か最近更新したノートから
              始めるのがおすすめです。
            </p>
          </div>
        )}
      </section>

      <section className="page-section space-y-5">
        <SectionIntro
          title="最近更新したノート"
          description="直近で手を入れたノートです。途中で止めた考えも、続きから読み返せます。"
          action={
            <Link href={buildNotesHref()} className="text-sm text-[var(--accent)]">
              すべて見る
            </Link>
          }
        />

        {recentNotes.length > 0 ? (
          <div className="space-y-4">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="まだノートがありません"
            description="最初の 1 件を書くと、ここに最近更新したノートが並びます。"
            primaryHref="/notes/new"
            primaryLabel="最初のノートを書く"
            secondaryHref={buildNotesHref()}
            secondaryLabel="ノート一覧へ"
          />
        )}
      </section>
    </main>
  );
}

type FocusCardProps = {
  href: string;
  label: string;
  value: string;
  description: string;
};

function FocusCard({ href, label, value, description }: FocusCardProps) {
  return (
    <Link
      href={href}
      className="quiet-panel px-5 py-5 transition hover:bg-[var(--surface-muted)] sm:px-6"
    >
      <div className="text-sm text-[var(--muted)]">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{value}</div>
      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{description}</p>
    </Link>
  );
}
