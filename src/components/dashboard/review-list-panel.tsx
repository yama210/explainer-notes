import Link from "next/link";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type ReviewListItem = {
  id: string;
  title: string;
  reviewDueAt: Date | null;
};

type ReviewListPanelProps = {
  title: string;
  href: string;
  items: ReviewListItem[];
  emptyLabel: string;
  isAlert?: boolean;
};

export function ReviewListPanel({
  title,
  href,
  items,
  emptyLabel,
  isAlert,
}: ReviewListPanelProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-[var(--line-light)] bg-[var(--surface)] p-5">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center text-sm font-semibold text-[var(--foreground)]">
          {isAlert ? (
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[var(--danger)]" />
          ) : null}
          {title}
        </h2>
        <Link
          href={href}
          className="self-end whitespace-nowrap text-xs text-[var(--accent)] hover:underline sm:self-auto"
        >
          一覧を見る
        </Link>
      </div>
      <div className="flex-1">
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/notes/${item.id}`}
                className={cn(
                  "block rounded-md border border-[var(--line-light)] px-3 py-2.5 transition-colors hover:bg-[var(--surface-muted)]",
                  isAlert && "hover:border-red-200",
                )}
              >
                <div className="truncate text-sm font-medium text-[var(--foreground)]">
                  {item.title}
                </div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  {formatDate(item.reviewDueAt)}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex h-full min-h-[80px] items-center justify-center rounded-md border border-dashed border-[var(--line)] py-4">
            <p className="text-sm text-[var(--muted)]">{emptyLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
}
