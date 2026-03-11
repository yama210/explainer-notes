import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
}: PageIntroProps) {
  return (
    <section className="page-section py-4">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,4fr)_auto] lg:items-end">
        <div className="space-y-3">
          <p className="text-sm font-medium text-[var(--accent)]">{eyebrow}</p>
          <h1 className="max-w-5xl font-heading text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-4xl text-base leading-relaxed text-[var(--muted)]">
            {description}
          </p>
        </div>
        {actions ? (
          <div className="flex flex-wrap gap-3 lg:justify-end lg:self-end">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
