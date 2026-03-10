import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
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
  tips = [],
}: EmptyStateProps) {
  return (
    <section className="page-section">
      <div className="quiet-panel px-6 py-12 sm:px-10">
        <div className="mx-auto max-w-2xl space-y-5 text-center">
          <p className="text-sm text-[var(--muted)]">Explainer Notes</p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
          <p className="text-sm leading-8 text-[var(--muted)]">{description}</p>

          {tips.length > 0 ? (
            <div className="rounded-2xl bg-[var(--surface-muted)] px-5 py-4 text-left">
              <p className="text-sm font-medium">最初の 1 件を書くときのヒント</p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--muted)]">
                {tips.map((tip) => (
                  <li key={tip}>- {tip}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
            <Link href={primaryHref} className="action-primary px-5 py-3">
              {primaryLabel}
            </Link>
            {secondaryHref && secondaryLabel ? (
              <Link href={secondaryHref} className="action-secondary px-5 py-3">
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
