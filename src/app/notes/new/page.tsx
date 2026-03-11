import { PageIntro } from "@/components/layout/page-intro";
import { NoteForm } from "@/components/note/note-form";
import { emptyNoteFormValues } from "@/lib/note-form-values";

export const metadata = {
  title: "新しいノート",
};

export default function NewNotePage() {
  return (
    <main className="space-y-8 pb-12">
      <PageIntro
        eyebrow="新規作成"
        title="理解したことを、自分の言葉で整理する"
        description="タイトルと要点から書き始めて、自分の言葉での説明、つまずき、次にやることへと広げていきます。"
      />

      <NoteForm mode="create" initialValues={emptyNoteFormValues} />
    </main>
  );
}
