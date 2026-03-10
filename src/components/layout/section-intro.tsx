import type { ReactNode } from "react";

type SectionIntroProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function SectionIntro({ title, description, action }: SectionIntroProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
        {description ? (
          <p className="text-sm leading-7 text-[var(--muted)]">{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
