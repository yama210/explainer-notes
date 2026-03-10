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
        <h2 className="text-xl font-semibold tracking-[-0.02em]">{title}</h2>
        <p className="text-sm leading-7 text-[var(--muted)]">{description}</p>
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
    <label className="block space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">{label}</span>
        {error ? <span className="text-sm text-[var(--danger)]">{error}</span> : null}
      </div>
      {description ? (
        <p className="text-sm leading-7 text-[var(--muted)]">{description}</p>
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
      className="rounded-full bg-white px-3 py-1.5 text-sm text-[var(--foreground)] transition hover:text-[var(--accent)]"
    >
      {children}
    </button>
  );
}
