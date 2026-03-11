import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { FocusCard } from "@/components/home/focus-card";
import { PageIntro } from "@/components/layout/page-intro";
import { SectionIntro } from "@/components/layout/section-intro";
import { NoteCard } from "@/components/note/note-card";
import { buildNotesHref } from "@/lib/note-links";
import { getDashboardData } from "@/lib/notes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { recentNotes, todayReviewNotes, overdueNotes, reviewQueue, stats } =
    await getDashboardData();

  return (
    <main className="space-y-16 pb-12">
      <PageIntro
        eyebrow="Explainer Notes"
        title="学んだことを、自分の言葉で説明できるノートにする"
        description="思いつきを書き留めるだけでなく、要点、説明、つまずき、次にやることまで整理して、理解の流れが残る学習ノートを目指します。"
        actions={
          <>
            <Link
              href={buildNotesHref({ review: "needs_review" })}
              className="action-primary px-6 py-3"
            >
              復習するノートを見る
            </Link>
            <Link href="/notes/new" className="action-secondary px-6 py-3">
              新しいノートを書く
            </Link>
          </>
        }
      />

      <section className="page-section space-y-6">
        <SectionIntro
          title="今日の学習"
          description="今日の復習、期限切れ、説明できるノートを並べて、いま何を見るべきかをすぐ判断できるようにしています。"
          action={
            <Link
              href={buildNotesHref()}
              className="text-sm font-medium text-[var(--accent)] transition-colors hover:text-white"
            >
              ノート一覧へ &rarr;
            </Link>
          }
        />

        <div className="grid gap-5 lg:grid-cols-3">
          <FocusCard
            href={buildNotesHref({ review: "due_soon" })}
            label="今日の復習"
            value={`${todayReviewNotes.length}件`}
            description={
              todayReviewNotes.length > 0
                ? "今日のうちに見返したいノートがまとまっています。学習の最初に確認しておくと進めやすくなります。"
                : "今日すぐに見返すノートはありません。次の復習候補を決めておくと、あとで迷いません。"
            }
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <FocusCard
            href={buildNotesHref({ review: "overdue" })}
            label="期限切れ"
            value={`${overdueNotes.length}件`}
            description="予定日を過ぎた復習ノートです。ここから先に手を付けると、学習の抜け漏れを減らせます。"
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
          <FocusCard
            href={buildNotesHref({ status: "EXPLAINABLE" })}
            label="説明できる"
            value={`${stats.explainable}件`}
            description={
              reviewQueue.length > 0
                ? `次に見返す候補は「${reviewQueue[0]?.title ?? "未設定"}」です。`
                : "理解が固まったノートを一覧で確認できます。"
            }
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      </section>

      <section className="page-section space-y-6">
        <SectionIntro
          title="今日復習するノート"
          description="今日が復習日のノートです。学習の流れを止めないよう、ここから順に見返せます。"
          action={
            <Link
              href={buildNotesHref({ review: "due_soon" })}
              className="text-sm font-medium text-[var(--accent)] transition-colors hover:text-white"
            >
              復習一覧へ &rarr;
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
          <div className="quiet-panel flex flex-col items-center px-6 py-10 text-center sm:px-8">
            <div className="mb-4 rounded-full bg-[var(--surface-muted)] p-3">
              <svg className="h-6 w-6 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-base font-medium text-[var(--foreground)]">
              今日の復習予定はありません
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">
              次に見返したいノートに復習日を設定しておくと、ここに表示されます。
            </p>
          </div>
        )}
      </section>

      <section className="page-section space-y-6">
        <SectionIntro
          title="最近更新したノート"
          description="直近で手を入れたノートです。復習の流れを保ちながら、最近の理解も追いかけられます。"
          action={
            <Link
              href={buildNotesHref()}
              className="text-sm font-medium text-[var(--accent)] transition-colors hover:text-white"
            >
              すべて見る &rarr;
            </Link>
          }
        />

        {recentNotes.length > 0 ? (
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-1 lg:gap-4">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="まだノートがありません"
            description="最初の1件を書いて、理解を整理する流れを作ってみてください。"
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
