import type { ReactNode } from "react";

type NoteFormSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function NoteFormSection({
  title,
  description,
  children,
}: NoteFormSectionProps) {
  return (
    <section className="quiet-panel px-5 py-6 sm:px-7">
      <div className="max-w-2xl space-y-1">
        <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">{title}</h2>
        <p className="text-sm leading-relaxed text-[var(--muted)]">{description}</p>
      </div>
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}

type NoteFormFieldProps = {
  label: string;
  description?: string;
  error?: string;
  children: ReactNode;
};

export function NoteFormField({
  label,
  description,
  error,
  children,
}: NoteFormFieldProps) {
  return (
    <label className="block space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>
        {error ? <span className="text-xs text-[var(--danger)]">{error}</span> : null}
      </div>
      {description ? (
        <p className="text-sm leading-relaxed text-[var(--muted)]">{description}</p>
      ) : null}
      {children}
    </label>
  );
}

type ToolbarButtonProps = {
  ariaLabel: string;
  onClick: () => void;
  children: ReactNode;
};

export function ToolbarButton({ ariaLabel, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="rounded-md border border-[var(--line)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-muted)]"
    >
      {children}
    </button>
  );
}
