import Link from "next/link";
import { formatDate, formatDateTime, formatRelativeFromNow } from "@/lib/format";
import { buildNotesHref } from "@/lib/note-links";
import { ListNoteItem } from "@/lib/notes";
import { excerpt, stripMarkdown } from "@/lib/utils";
import { NoteStatusBadge } from "./note-status-badge";

type NoteCardProps = {
  note: ListNoteItem;
  annotation?: string;
};

export function NoteCard({ note, annotation }: NoteCardProps) {
  const preview = excerpt(
    note.summary ||
      note.explanation ||
      stripMarkdown(note.body) ||
      "まだ要点は入力されていません。",
    150,
  );

  return (
    <article className="quiet-panel px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <NoteStatusBadge status={note.status} />
            {note.needsReview ? (
              <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] text-[var(--muted)]">
                復習 {note.reviewDueAt ? formatDate(note.reviewDueAt) : "未設定"}
              </span>
            ) : null}
          </div>
          <div className="text-sm text-[var(--muted)]">
            更新 {formatDateTime(note.updatedAt)}
          </div>
        </div>

        <div className="space-y-2">
          <Link
            href={`/notes/${note.id}`}
            className="text-[1.22rem] font-semibold tracking-[-0.03em] transition hover:text-[var(--accent)]"
          >
            {note.title}
          </Link>
          <p className="max-w-3xl text-sm leading-8 text-[var(--muted)]">{preview}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
          {note.needsReview && note.reviewDueAt ? (
            <span>次回復習 {formatRelativeFromNow(note.reviewDueAt)}</span>
          ) : null}
          {note.reviewCount > 0 ? <span>復習 {note.reviewCount}回</span> : null}
        </div>

        {annotation ? (
          <div className="rounded-2xl bg-[var(--surface-muted)] px-3.5 py-3 text-xs leading-6 text-[var(--muted)]">
            関連理由: {annotation}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          {note.tags.length > 0 ? (
            note.tags.map((tag) => (
              <Link
                key={tag}
                href={buildNotesHref({ tag })}
                className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1.5 text-xs text-[var(--muted)] transition hover:text-[var(--accent)]"
              >
                #{tag}
              </Link>
            ))
          ) : (
            <span className="text-xs text-[var(--muted)]">タグなし</span>
          )}
        </div>
      </div>
    </article>
  );
}
