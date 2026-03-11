import { PageIntro } from "@/components/layout/page-intro";
import { NoteForm } from "@/components/note/note-form";
import { toNoteFormValues } from "@/lib/note-form-values";
import { getNoteForEdit } from "@/lib/notes";
import { noteStatusMeta } from "@/lib/note-status";

export const dynamic = "force-dynamic";

type EditNotePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata = {
  title: "ノートを編集",
};

export default async function EditNotePage({ params }: EditNotePageProps) {
  const { id } = await params;
  const note = await getNoteForEdit(id);

  return (
    <main className="space-y-8 pb-12">
      <PageIntro
        eyebrow="ノートを編集"
        title={note.title}
        description="内容を見直しながら、要点や説明を更新します。編集中の内容は自動保存されるので、書きながら少しずつ整えられます。"
      />

      <div className="page-section flex flex-wrap gap-2 text-sm text-[var(--muted)]">
        <span className="rounded-md bg-[var(--surface-muted)] px-2.5 py-1">
          ステータス {noteStatusMeta[note.status].label}
        </span>
        <span className="rounded-md bg-[var(--surface-muted)] px-2.5 py-1">
          タグ {note.tags.length > 0 ? note.tags.join(", ") : "なし"}
        </span>
        <span className="rounded-md bg-[var(--surface-muted)] px-2.5 py-1">
          復習 {note.needsReview ? "あり" : "なし"}
        </span>
      </div>

      <NoteForm
        mode="edit"
        noteId={note.id}
        initialValues={toNoteFormValues(note)}
      />
    </main>
  );
}
