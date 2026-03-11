type NoteDetailMetaItemProps = {
  label: string;
  value: string;
};

export function NoteDetailMetaItem({
  label,
  value,
}: NoteDetailMetaItemProps) {
  return (
    <div>
      <dt className="text-xs font-medium text-[var(--muted)]">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-[var(--foreground)]">{value}</dd>
    </div>
  );
}
