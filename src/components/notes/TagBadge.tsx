type TagBadgeProps = {
  name: string;
};

export function TagBadge({ name }: TagBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
      #{name}
    </span>
  );
}
