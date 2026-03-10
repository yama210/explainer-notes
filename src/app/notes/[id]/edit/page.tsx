import { PageIntro } from "@/components/layout/page-intro";
import { NoteForm } from "@/components/note/note-form";
import { formatDateInput } from "@/lib/format";
import { getNoteForEdit } from "@/lib/notes";

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
        description="説明の言い回し、つまずき、次にやることを少しずつ整えていくための編集画面です。編集中の内容は自動保存されます。"
      >
        <div className="flex flex-wrap gap-2 text-sm text-[var(--muted)]">
          <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5">
            タグ {note.tags.length > 0 ? note.tags.join(", ") : "なし"}
          </span>
          <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5">
            復習 {note.needsReview ? "あり" : "なし"}
          </span>
        </div>
      </PageIntro>

      <NoteForm
        mode="edit"
        noteId={note.id}
        initialValues={{
          title: note.title,
          summary: note.summary,
          explanation: note.explanation,
          stuckPoints: note.stuckPoints,
          nextActions: note.nextActions,
          body: note.body,
          tagsText: note.tags.join(", "),
          status: note.status,
          needsReview: note.needsReview,
          reviewDueAt: formatDateInput(note.reviewDueAt),
        }}
      />
    </main>
  );
}
