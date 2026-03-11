import { NoteStatus } from "@prisma/client";
import { noteStatusMeta } from "@/lib/note-status";
import { cn } from "@/lib/utils";

type NoteStatusBadgeProps = {
  status: NoteStatus;
};

export function NoteStatusBadge({ status }: NoteStatusBadgeProps) {
  const meta = noteStatusMeta[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        meta.classes,
      )}
    >
      {meta.label}
    </span>
  );
}
