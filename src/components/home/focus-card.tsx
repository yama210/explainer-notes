import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FocusCardProps = {
  href: string;
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
};

export function FocusCard({
  href,
  label,
  value,
  description,
  icon,
}: FocusCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg border border-[var(--line-light)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--line)]",
      )}
    >
      <div className="flex items-center justify-between text-sm text-[var(--muted)]">
        <span>{label}</span>
        <div className="text-[var(--accent)]">{icon}</div>
      </div>
      <div className="mt-2 font-heading text-3xl font-bold text-[var(--foreground)]">
        {value}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
        {description}
      </p>
    </Link>
  );
}
