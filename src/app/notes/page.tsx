import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { SectionIntro } from "@/components/layout/section-intro";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { EmptyState } from "@/components/empty-state";
import { ActiveFilters } from "@/components/note/active-filters";
import { FilterForm } from "@/components/note/filter-form";
import { NoteCard } from "@/components/note/note-card";
import { buildNotesHref } from "@/lib/note-links";
import { listNotes } from "@/lib/notes";
import { noteListQuerySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type NotesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const rawSearchParams = await searchParams;
  const filters = noteListQuerySchema.parse({
    q: getSingleValue(rawSearchParams.q),
    status: getSingleValue(rawSearchParams.status),
    tag: getSingleValue(rawSearchParams.tag),
    sort: getSingleValue(rawSearchParams.sort),
    review: getSingleValue(rawSearchParams.review),
  });

  const { notes, total, availableTags, stats, reviewQueue, overdueNotes } =
    await listNotes(filters);
  const hasFilters = Boolean(
    filters.q || filters.tag || filters.status !== "ALL" || filters.review !== "all",
  );

  return (
    <main className="space-y-10 pb-12">
      <PageIntro
        eyebrow="ノート一覧"
        title="学習ノートを、理解の流れごとに整理する"
        description="キーワード、ステータス、タグ、復習条件で絞り込みながら、いま見直すべきノートを探せます。検索条件は URL に残るので、そのまま再訪や共有にも使えます。"
        actions={
          <>
            <Link
              href={buildNotesHref({ review: "needs_review" })}
              className="action-secondary px-5 py-3"
            >
              復習するノートへ
            </Link>
            <Link href="/notes/new" className="action-primary px-5 py-3">
              新しいノート
            </Link>
          </>
        }
      />

      <DashboardStats stats={stats} reviewQueue={reviewQueue} overdueNotes={overdueNotes} />
      <FilterForm filters={filters} availableTags={availableTags} />
      <ActiveFilters filters={filters} />

      <section className="page-section space-y-5">
        <SectionIntro
          title={hasFilters ? "絞り込み結果" : "すべてのノート"}
          description={`${total} 件のノートがあります。`}
          action={
            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                href={buildNotesHref({ review: "needs_review" })}
                className="text-[var(--accent)]"
              >
                復習対象を見る
              </Link>
              <Link
                href={buildNotesHref({ review: "overdue" })}
                className="text-[var(--accent)]"
              >
                期限切れを見る
              </Link>
            </div>
          }
        />

        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : hasFilters ? (
          <EmptyState
            title="条件に合うノートが見つかりませんでした"
            description="キーワードやタグを少し広げるか、復習条件を外して探してみてください。"
            primaryHref={buildNotesHref()}
            primaryLabel="絞り込みをリセット"
            secondaryHref="/notes/new"
            secondaryLabel="新しく作成する"
            tips={[
              "タグだけでなく、タイトルや要点の言い回しも変えてみる",
              "復習条件は「期限切れ」より「復習対象のみ」の方が広く探せる",
              "新しく作るなら、まずは一言で言える要点から書き始める",
            ]}
          />
        ) : (
          <EmptyState
            title="まだノートがありません"
            description="最初の 1 件を書くと、ここに理解の流れごとのノートが並びます。"
            primaryHref="/notes/new"
            primaryLabel="最初のノートを書く"
            secondaryHref="/"
            secondaryLabel="ホームへ戻る"
            tips={[
              "タイトルは、あとから一覧で見返したときに分かる言葉にする",
              "要点には一言で説明できる内容を先に置く",
              "説明には自分の言葉で理解の流れを書く",
            ]}
          />
        )}
      </section>
    </main>
  );
}

function getSingleValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
