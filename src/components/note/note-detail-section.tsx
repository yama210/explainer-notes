import type { ReactNode } from "react";

type NoteDetailSectionProps = {
  title: string;
  children: ReactNode;
  icon?: string;
  color?: string;
};

export function NoteDetailSection({
  title,
  children,
  icon,
  color = "text-[var(--accent)]",
}: NoteDetailSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-[var(--foreground)]">
        {icon ? (
          <svg
            className={`h-5 w-5 ${color}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={icon}
            />
          </svg>
        ) : null}
        {title}
      </h2>
      <div className="max-w-none whitespace-pre-wrap pl-7 text-[15px] leading-relaxed text-[var(--muted)]">
        {children}
      </div>
    </section>
  );
}
