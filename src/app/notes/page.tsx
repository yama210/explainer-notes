import Link from "next/link";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { EmptyState } from "@/components/empty-state";
import { PageIntro } from "@/components/layout/page-intro";
import { SectionIntro } from "@/components/layout/section-intro";
import { ActiveFilters } from "@/components/note/active-filters";
import { FilterForm } from "@/components/note/filter-form";
import { NoteCard } from "@/components/note/note-card";
import { buildNotesHref } from "@/lib/note-links";
import { listNotes } from "@/lib/notes";
import { pickSearchParamValues } from "@/lib/search-params";
import { noteListQuerySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type NotesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const rawSearchParams = await searchParams;
  const filters = noteListQuerySchema.parse(
    pickSearchParamValues(rawSearchParams, [
      "q",
      "status",
      "tag",
      "sort",
      "review",
    ] as const),
  );

  const { notes, total, availableTags, stats, reviewQueue, overdueNotes } =
    await listNotes(filters);

  const hasFilters = Boolean(
    filters.q ||
      filters.tag ||
      filters.status !== "ALL" ||
      filters.review !== "all",
  );

  return (
    <main className="space-y-12 pb-12">
      <PageIntro
        eyebrow="ノート一覧"
        title="学習ノートを見つけて、読み返して、次の理解につなげる"
        description="キーワード、ステータス、タグ、復習条件で絞り込みながら、今読むべきノートを静かに探せる一覧です。"
        actions={
          <>
            <Link
              href={buildNotesHref({ review: "needs_review" })}
              className="action-secondary px-6 py-3"
            >
              復習するノートを見る
            </Link>
            <Link href="/notes/new" className="action-primary px-6 py-3">
              新しいノートを書く
            </Link>
          </>
        }
      />

      <div className="space-y-4">
        <FilterForm filters={filters} availableTags={availableTags} />
        <ActiveFilters filters={filters} />
      </div>

      <section className="page-section space-y-6">
        <SectionIntro
          title={hasFilters ? "検索結果" : "すべてのノート"}
          description={`${total} 件のノートがあります。`}
          action={
            <div className="flex flex-wrap gap-4 text-sm font-medium">
              <Link
                href={buildNotesHref({ review: "needs_review" })}
                className="text-[var(--accent)] transition-colors hover:text-white"
              >
                要復習を見る &rarr;
              </Link>
              <Link
                href={buildNotesHref({ review: "overdue" })}
                className="text-rose-400 transition-colors hover:text-rose-300"
              >
                期限切れを見る &rarr;
              </Link>
            </div>
          }
        />

        {notes.length > 0 ? (
          <div className="space-y-5">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : hasFilters ? (
          <EmptyState
            title="条件に合うノートが見つかりませんでした"
            description="キーワードやタグを少し広げるか、復習条件を外して探してみてください。"
            primaryHref={buildNotesHref()}
            primaryLabel="条件をリセット"
            secondaryHref="/notes/new"
            secondaryLabel="新しいノートを書く"
            tips={[
              "キーワードだけでなく、タグでも探せます。",
              "復習条件は「要復習」「近日中に復習」「期限切れ」で切り替えられます。",
              "まだノートがないテーマは、新規作成から追加できます。",
            ]}
          />
        ) : (
          <EmptyState
            title="まだノートがありません"
            description="最初の1件を書いて、理解を整理する流れを作ってみてください。"
            primaryHref="/notes/new"
            primaryLabel="最初のノートを書く"
            secondaryHref="/"
            secondaryLabel="ホームへ戻る"
            tips={[
              "タイトルは、あとから一目で内容を思い出せる言い方にします。",
              "要点には一言で説明できる内容を書くと見返しやすくなります。",
              "本文には自分の言葉で説明したことや補足メモを書いておくと役立ちます。",
            ]}
          />
        )}
      </section>

      <DashboardStats
        stats={stats}
        reviewQueue={reviewQueue}
        overdueNotes={overdueNotes}
      />
    </main>
  );
}
