import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-12 md:px-8">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">理解整理ノート</h1>
        <p className="text-slate-700">
          学習内容をテンプレートに沿って整理し、理解できる形で再利用するためのノートアプリです。
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/notes"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            ノート一覧へ
          </Link>
          <Link
            href="/notes/new"
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            新規作成へ
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="font-semibold text-slate-900">テンプレート型ノート</h2>
          <p className="mt-2 text-sm text-slate-700">
            concept / error / phrase / procedure から選んで、整理しながら記録できます。
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="font-semibold text-slate-900">検索・フィルタ</h2>
          <p className="mt-2 text-sm text-slate-700">
            タイトル検索、タグ絞り込み、分野フィルタで必要な知識をすぐに見つけられます。
          </p>
        </article>
      </section>
    </main>
  );
}
