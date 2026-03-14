import Link from "next/link";
import type { ReactNode } from "react";
import { SectionIntro } from "@/components/layout/section-intro";
import { buildNotesHref } from "@/lib/note-links";
import { noteStatusMeta, type NoteStatusValue } from "@/lib/note-status";
import { ReviewListPanel } from "./review-list-panel";
import { StatLinkCard } from "./stat-link-card";

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
    statusCounts: Array<{ status: NoteStatusValue; count: number }>;
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
    <section className="page-section space-y-6">
      <SectionIntro
        title="学習の状況"
        description="ノートの進み具合と、次に見返したい復習候補をまとめて確認できます。"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatLinkCard label="総ノート数" value={stats.total} href={buildNotesHref()} />
        <StatLinkCard
          label="説明できる"
          value={stats.explainable}
          href={buildNotesHref({ status: "EXPLAINABLE" })}
        />
        <StatLinkCard
          label="要復習"
          value={stats.needsReview}
          href={buildNotesHref({ review: "needs_review" })}
        />
        <StatLinkCard
          label="期限切れ"
          value={stats.overdue}
          href={buildNotesHref({ review: "overdue" })}
        />
      </div>

      <div className="rounded-lg border border-[var(--line-light)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="space-y-6">
          <StatsGroup title="ステータス別の内訳">
            {stats.statusCounts.map(({ status, count }) => (
              <Link
                key={status}
                href={buildNotesHref({ status })}
                className="flex items-center rounded-md bg-[var(--surface-muted)] px-3 py-1.5 text-sm transition-colors hover:text-[var(--accent)]"
              >
                <span>{noteStatusMeta[status].label}</span>
                <span className="ml-1.5 text-xs text-[var(--muted)]">{count}</span>
              </Link>
            ))}
          </StatsGroup>

          <StatsGroup title="今週よく触ったテーマ">
            {stats.weeklyThemes.length > 0 ? (
              stats.weeklyThemes.map(({ tag, count }) => (
                <Link
                  key={tag}
                  href={buildNotesHref({ tag })}
                  className="flex items-center rounded-md bg-[var(--surface-muted)] px-3 py-1.5 text-sm transition-colors hover:text-[var(--accent)]"
                >
                  #{tag}
                  <span className="ml-1.5 text-xs text-[var(--muted)]">{count}</span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">
                今週更新したテーマはまだありません。
              </p>
            )}
          </StatsGroup>

          <StatsGroup title="よく使うタグ">
            {stats.topTags.length > 0 ? (
              stats.topTags.map(({ tag, count }) => (
                <Link
                  key={tag}
                  href={buildNotesHref({ tag })}
                  className="flex items-center rounded-md bg-[var(--surface-muted)] px-3 py-1.5 text-sm transition-colors hover:text-[var(--accent)]"
                >
                  #{tag}
                  <span className="ml-1.5 text-xs text-[var(--muted)]">{count}</span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">
                まだタグ付きのノートはありません。
              </p>
            )}
          </StatsGroup>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <ReviewListPanel
          title="近日中に復習"
          emptyLabel="近日中に復習するノートはありません。"
          href={buildNotesHref({ review: "due_soon" })}
          items={reviewQueue}
        />
        <ReviewListPanel
          title="期限切れの復習"
          emptyLabel="期限切れの復習はありません。"
          href={buildNotesHref({ review: "overdue" })}
          items={overdueNotes}
          isAlert
        />
      </div>
    </section>
  );
}

function StatsGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="border-b border-[var(--line-light)] pb-2 text-sm font-semibold text-[var(--foreground)]">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
