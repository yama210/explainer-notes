import Link from "next/link";
import { createNoteAction } from "@/app/notes/actions";
import { NoteForm } from "@/components/notes/NoteForm";

export default function NewNotePage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 md:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">ノート作成</h1>
        <p className="text-sm text-slate-600">テンプレートを選んで学習内容を整理します。</p>
      </header>

      <NoteForm action={createNoteAction} submitLabel="保存する" />

      <Link href="/notes" className="inline-block text-sm text-slate-600 hover:text-slate-900">
        ← 一覧へ戻る
      </Link>
    </main>
  );
}
