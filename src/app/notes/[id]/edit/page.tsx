import Link from "next/link";
import { notFound } from "next/navigation";
import { updateNoteAction } from "@/app/notes/actions";
import { NoteForm } from "@/components/notes/NoteForm";
import { parseTemplateContent } from "@/lib/note-content";
import { prisma } from "@/lib/prisma";

type EditNotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditNotePage({ params }: EditNotePageProps) {
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

  const fields = parseTemplateContent(note.noteType, note.content) ?? {};
  const action = updateNoteAction.bind(null, note.id);

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 md:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">ノート編集</h1>
        <p className="text-sm text-slate-600">既存内容を更新して保存します。</p>
      </header>

      <NoteForm
        action={action}
        submitLabel="更新する"
        initialData={{
          title: note.title,
          noteType: note.noteType,
          subject: note.subject,
          tagsText: note.noteTags.map((item) => item.tag.name).join(", "),
          fields,
        }}
      />

      <Link
        href={`/notes/${note.id}`}
        className="inline-block text-sm text-slate-600 hover:text-slate-900"
      >
        ← 詳細へ戻る
      </Link>
    </main>
  );
}
