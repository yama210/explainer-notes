import Link from "next/link";
import {
  formatDate,
  formatDateTime,
  formatRelativeFromNow,
} from "@/lib/format";
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
    <article className="rounded-lg border border-[var(--line-light)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--line)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <NoteStatusBadge status={note.status} />
          {note.needsReview ? (
            <span className="rounded-full bg-[var(--danger-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--danger)]">
              復習日 {note.reviewDueAt ? formatDate(note.reviewDueAt) : "未設定"}
            </span>
          ) : null}
        </div>
        <span className="text-xs text-[var(--muted)]">
          更新 {formatDateTime(note.updatedAt)}
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        <Link
          href={`/notes/${note.id}`}
          className="font-heading text-lg font-semibold text-[var(--foreground)] hover:text-[var(--accent)]"
        >
          {note.title}
        </Link>
        <p className="text-sm leading-relaxed text-[var(--muted)]">{preview}</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
        {note.needsReview && note.reviewDueAt ? (
          <span>次の復習まで {formatRelativeFromNow(note.reviewDueAt)}</span>
        ) : null}
        {note.reviewCount > 0 ? <span>復習 {note.reviewCount} 回</span> : null}
      </div>

      {annotation ? (
        <div className="mt-3 rounded-md bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--muted)]">
          <span className="font-medium text-[var(--foreground)]">関連理由:</span>{" "}
          {annotation}
        </div>
      ) : null}

      {note.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {note.tags.map((tag) => (
            <Link
              key={tag}
              href={buildNotesHref({ tag })}
              className="rounded-md bg-[var(--surface-muted)] px-2 py-1 text-xs text-[var(--muted)] hover:text-[var(--accent)]"
            >
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}
