import Link from "next/link";
import { NoteStatus } from "@prisma/client";
import { formatDate } from "@/lib/format";
import { buildNotesHref } from "@/lib/note-links";
import { noteStatusMeta } from "@/lib/note-status";
import { SectionIntro } from "@/components/layout/section-intro";

type ReviewListItem = {
  id: string;
  title: string;
  reviewDueAt: Date | null;
};

type DashboardStatsProps = {
  stats: {
    total: number;
    needsReview: number;
    overdue: number;
    explainable: number;
    statusCounts: Array<{ status: NoteStatus; count: number }>;
    topTags: Array<{ tag: string; count: number }>;
    weeklyThemes: Array<{ tag: string; count: number }>;
  };
  reviewQueue: ReviewListItem[];
  overdueNotes: ReviewListItem[];
};

export function DashboardStats({
  stats,
  reviewQueue,
  overdueNotes,
}: DashboardStatsProps) {
  return (
    <section className="page-section space-y-5">
      <SectionIntro
        title="学習の状況"
        description="いまの理解段階、復習の滞留、よく触っているテーマをひと目で確認できます。"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="総ノート数" value={stats.total} href={buildNotesHref()} />
        <StatCard
          label="説明できる"
          value={stats.explainable}
          href={buildNotesHref({ status: "EXPLAINABLE" })}
        />
        <StatCard
          label="復習対象"
          value={stats.needsReview}
          href={buildNotesHref({ review: "needs_review" })}
        />
        <StatCard
          label="期限切れ"
          value={stats.overdue}
          href={buildNotesHref({ review: "overdue" })}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="quiet-panel px-5 py-5 sm:px-6">
          <div className="space-y-5">
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-[var(--muted)]">
                ステータス別の内訳
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {stats.statusCounts.map(({ status, count }) => (
                  <Link
                    key={status}
                    href={buildNotesHref({ status })}
                    className="rounded-full bg-[var(--surface-muted)] px-3 py-2 text-sm transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                  >
                    <span>{noteStatusMeta[status].label}</span>
                    <span className="ml-2 text-[var(--muted)]">{count}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-medium text-[var(--muted)]">今週よく触ったテーマ</h2>
              {stats.weeklyThemes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stats.weeklyThemes.map(({ tag, count }) => (
                    <Link
                      key={tag}
                      href={buildNotesHref({ tag })}
                      className="rounded-full bg-[var(--surface-muted)] px-3 py-2 text-sm"
                    >
                      #{tag}
                      <span className="ml-1 text-[var(--muted)]">{count}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-[var(--muted)]">
                  今週更新したテーマはまだありません。
                </p>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-medium text-[var(--muted)]">よく使うタグ</h2>
              {stats.topTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stats.topTags.map(({ tag, count }) => (
                    <Link
                      key={tag}
                      href={buildNotesHref({ tag })}
                      className="rounded-full bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--foreground)]"
                    >
                      #{tag}
                      <span className="ml-1 text-[var(--muted)]">{count}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-[var(--muted)]">
                  まだタグ付きのノートはありません。
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <ReviewListPanel
            title="近い復習予定"
            emptyLabel="復習予定のノートはありません。"
            href={buildNotesHref({ review: "due_soon" })}
            items={reviewQueue}
          />
          <ReviewListPanel
            title="期限切れの復習"
            emptyLabel="期限切れの復習はありません。"
            href={buildNotesHref({ review: "overdue" })}
            items={overdueNotes}
          />
        </div>
      </div>
    </section>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  href: string;
};

function StatCard({ label, value, href }: StatCardProps) {
  return (
    <Link
      href={href}
      className="quiet-panel px-5 py-5 transition hover:bg-[var(--surface-muted)] sm:px-6"
    >
      <div className="text-sm text-[var(--muted)]">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{value}</div>
    </Link>
  );
}

type ReviewListPanelProps = {
  title: string;
  href: string;
  items: ReviewListItem[];
  emptyLabel: string;
};

function ReviewListPanel({ title, href, items, emptyLabel }: ReviewListPanelProps) {
  return (
    <div className="quiet-panel px-5 py-5 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-[var(--muted)]">{title}</h2>
        <Link href={href} className="text-sm text-[var(--accent)]">
          一覧へ
        </Link>
      </div>
      {items.length > 0 ? (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/notes/${item.id}`}
              className="block rounded-2xl bg-[var(--surface-muted)] px-4 py-3 transition hover:bg-[var(--accent-soft)]"
            >
              <div className="font-medium">{item.title}</div>
              <div className="mt-1 text-sm text-[var(--muted)]">
                復習日 {formatDate(item.reviewDueAt)}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{emptyLabel}</p>
      )}
    </div>
  );
}
