import Link from "next/link";
import { buildNotesHref } from "@/lib/note-links";
import { noteStatusMeta, sortOptions } from "@/lib/note-status";
import type { NoteListQuery } from "@/lib/validation";

type ActiveFiltersProps = {
  filters: NoteListQuery;
};

const reviewLabels: Record<NoteListQuery["review"], string> = {
  all: "すべて",
  needs_review: "要復習",
  due_soon: "近日中に復習",
  overdue: "期限切れ",
};

export function ActiveFilters({ filters }: ActiveFiltersProps) {
  const chips: string[] = [];

  if (filters.q) {
    chips.push(`キーワード: ${filters.q}`);
  }

  if (filters.status !== "ALL") {
    chips.push(`ステータス: ${noteStatusMeta[filters.status].label}`);
  }

  if (filters.tag) {
    chips.push(`タグ: #${filters.tag}`);
  }

  if (filters.review !== "all") {
    chips.push(`復習: ${reviewLabels[filters.review]}`);
  }

  if (filters.sort !== "updated_desc") {
    const sortLabel =
      sortOptions.find((option) => option.value === filters.sort)?.label ??
      filters.sort;
    chips.push(`並び順: ${sortLabel}`);
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="page-section flex flex-wrap items-center gap-2 py-2">
      <span className="text-xs font-medium text-[var(--muted)]">
        適用中の条件:
      </span>
      {chips.map((chip) => (
        <span
          key={chip}
          className="rounded-md bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]"
        >
          {chip}
        </span>
      ))}
      <Link
        href={buildNotesHref()}
        className="ml-1 text-xs font-medium text-[var(--danger)] hover:underline"
      >
        すべて解除
      </Link>
    </div>
  );
}
