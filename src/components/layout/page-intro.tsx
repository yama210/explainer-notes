import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageIntroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: PageIntroProps) {
  return (
    <section
      className={cn(
        "page-section flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl space-y-3">
        {eyebrow ? <p className="text-sm text-[var(--muted)]">{eyebrow}</p> : null}
        <h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-8 text-[var(--muted)]">{description}</p>
        ) : null}
        {children}
      </div>

      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </section>
  );
}
