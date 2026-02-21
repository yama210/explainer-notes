import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isSubject, SUBJECTS, SUBJECT_LABELS } from "@/lib/note-template";
import { NoteCard } from "@/components/notes/NoteCard";

type SearchParams = {
  q?: string | string[];
  subject?: string | string[];
  tag?: string | string[];
};

type NotesPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const rawSubject = Array.isArray(params.subject)
    ? params.subject[0]
    : params.subject;
  const rawTag = Array.isArray(params.tag) ? params.tag[0] : params.tag;

  const query = rawQuery?.trim() ?? "";
  const normalizedSubject = rawSubject ?? "";
  const subject = isSubject(normalizedSubject) ? normalizedSubject : "all";
  const tagSlug = rawTag?.trim() ?? "";

  const whereClause = {
    ...(subject !== "all" ? { subject } : {}),
    ...(tagSlug
      ? {
          noteTags: {
            some: {
              tag: {
                slug: tagSlug,
              },
            },
          },
        }
      : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { content: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [notes, allTags] = await Promise.all([
    prisma.note.findMany({
      where: whereClause,
      include: {
        noteTags: {
          include: { tag: true },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 md:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">ノート一覧</h1>
        <p className="text-sm text-slate-600">検索・フィルタしながら理解ノートを管理できます。</p>
      </header>

      <form className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            name="q"
            defaultValue={query}
            placeholder="タイトル/本文を検索"
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-200 focus:ring-2"
          />

          <select
            name="subject"
            defaultValue={subject}
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-200 focus:ring-2"
          >
            <option value="all">すべての分野</option>
            {SUBJECTS.map((item) => (
              <option key={item} value={item}>
                {SUBJECT_LABELS[item]}
              </option>
            ))}
          </select>

          <select
            name="tag"
            defaultValue={tagSlug}
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-200 focus:ring-2"
          >
            <option value="">すべてのタグ</option>
            {allTags.map((tag) => (
              <option key={tag.id} value={tag.slug}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            絞り込み
          </button>
          <Link
            href="/notes"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            リセット
          </Link>
          <Link
            href="/notes/new"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            新規作成
          </Link>
        </div>
      </form>

      {notes.length > 0 ? (
        <ul className="space-y-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-600">
          条件に一致するノートがありません。
        </p>
      )}
    </main>
  );
}
