import Link from "next/link";
import { NOTE_TYPE_LABELS, SUBJECT_LABELS, type NoteType, type Subject } from "@/lib/note-template";
import { TagBadge } from "@/components/notes/TagBadge";

type NoteCardProps = {
  note: {
    id: string;
    title: string;
    noteType: NoteType;
    subject: Subject;
    updatedAt: Date;
    noteTags: Array<{
      tag: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
  };
};

export function NoteCard({ note }: NoteCardProps) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <Link href={`/notes/${note.id}`} className="block space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{note.title}</h3>
          <span className="text-xs text-slate-500">
            更新: {note.updatedAt.toLocaleDateString("ja-JP")}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">
            {NOTE_TYPE_LABELS[note.noteType]}
          </span>
          <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-700">
            {SUBJECT_LABELS[note.subject]}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {note.noteTags.length > 0 ? (
            note.noteTags.map(({ tag }) => <TagBadge key={tag.id} name={tag.name} />)
          ) : (
            <span className="text-xs text-slate-500">タグなし</span>
          )}
        </div>
      </Link>
    </li>
  );
}
