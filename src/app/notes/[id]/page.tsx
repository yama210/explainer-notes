import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteNoteAction } from "@/app/notes/actions";
import { NoteContentView } from "@/components/notes/NoteContentView";
import { TagBadge } from "@/components/notes/TagBadge";
import { NOTE_TYPE_LABELS, SUBJECT_LABELS } from "@/lib/note-template";
import { prisma } from "@/lib/prisma";

type NoteDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { id } = await params;
  const note = await prisma.note.findUnique({
    where: { id },
    include: {
      noteTags: {
        include: { tag: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!note) {
    notFound();
  }

  const deleteAction = deleteNoteAction.bind(null, note.id);

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10 md:px-8">
      <header className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">{note.title}</h1>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">
                {NOTE_TYPE_LABELS[note.noteType]}
              </span>
              <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-700">
                {SUBJECT_LABELS[note.subject]}
              </span>
              <span className="text-slate-500">
                更新日: {note.updatedAt.toLocaleString("ja-JP")}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/notes/${note.id}/edit`}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              編集
            </Link>
            <form action={deleteAction}>
              <button
                type="submit"
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
              >
                削除
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {note.noteTags.length > 0 ? (
            note.noteTags.map(({ tag }) => <TagBadge key={tag.id} name={tag.name} />)
          ) : (
            <span className="text-sm text-slate-500">タグなし</span>
          )}
        </div>
      </header>

      <NoteContentView noteType={note.noteType} content={note.content} />

      <Link href="/notes" className="inline-block text-sm text-slate-600 hover:text-slate-900">
        ← 一覧へ戻る
      </Link>
    </main>
  );
}
