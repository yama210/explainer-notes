import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  tips?: string[];
};

export function EmptyState({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  tips,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-[var(--line)] px-6 py-12 text-center">
      <h3 className="font-heading text-lg font-semibold text-[var(--foreground)]">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">
        {description}
      </p>

      {primaryHref || secondaryHref ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {primaryHref && primaryLabel ? (
            <Link href={primaryHref} className="action-primary px-5 py-2.5">
              {primaryLabel}
            </Link>
          ) : null}
          {secondaryHref && secondaryLabel ? (
            <Link href={secondaryHref} className="action-secondary px-5 py-2.5">
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      ) : null}

      {tips && tips.length > 0 ? (
        <ul className="mt-6 max-w-md space-y-1.5 text-left text-sm text-[var(--muted)]">
          {tips.map((tip) => (
            <li key={tip} className="flex gap-2">
              <span className="text-[var(--accent)]">・</span>
              {tip}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
