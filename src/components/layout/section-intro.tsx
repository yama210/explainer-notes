import type { ReactNode } from "react";

type SectionIntroProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function SectionIntro({
  title,
  description,
  action,
}: SectionIntroProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1">
        <h2 className="font-heading text-xl font-semibold text-[var(--foreground)]">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          {description}
        </p>
      </div>
      {action ?? null}
    </div>
  );
}
