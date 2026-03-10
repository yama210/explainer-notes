import Link from "next/link";
import { buildNotesHref } from "@/lib/note-links";
import { noteStatusMeta, sortOptions } from "@/lib/note-status";
import type { NoteListQuery } from "@/lib/validation";

type ActiveFiltersProps = {
  filters: NoteListQuery;
};

const reviewLabels: Record<NoteListQuery["review"], string> = {
  all: "すべて",
  needs_review: "復習対象のみ",
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
    chips.push(`復習条件: ${reviewLabels[filters.review]}`);
  }

  if (filters.sort !== "updated_desc") {
    const sortLabel =
      sortOptions.find((option) => option.value === filters.sort)?.label ?? filters.sort;
    chips.push(`並び順: ${sortLabel}`);
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="page-section flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip}
          className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-sm text-[var(--muted)]"
        >
          {chip}
        </span>
      ))}
      <Link href={buildNotesHref()} className="text-sm text-[var(--accent)]">
        すべて解除
      </Link>
    </div>
  );
}
