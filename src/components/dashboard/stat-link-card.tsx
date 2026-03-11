import Link from "next/link";

type StatLinkCardProps = {
  label: string;
  value: number;
  href: string;
};

export function StatLinkCard({
  label,
  value,
  href,
}: StatLinkCardProps) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-[var(--line-light)] bg-[var(--surface)] px-5 py-4 transition-colors hover:border-[var(--line)]"
    >
      <div className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-2 font-heading text-3xl font-bold text-[var(--foreground)]">
        {value}
      </div>
    </Link>
  );
}
