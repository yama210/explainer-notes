import { NoteStatus } from "@prisma/client";
import { PageIntro } from "@/components/layout/page-intro";
import { NoteForm } from "@/components/note/note-form";

export const metadata = {
  title: "新しいノート",
};

export default function NewNotePage() {
  return (
    <main className="space-y-8 pb-12">
      <PageIntro
        eyebrow="新規作成"
        title="理解の輪郭から、静かに書き始める"
        description="まずは要点を一言で置き、そのあとに自分の言葉で説明を書き足していくと、後から読み返しやすいノートになります。"
      />

      <section className="page-section">
        <div className="quiet-panel max-w-3xl px-5 py-5 sm:px-6">
          <h2 className="text-lg font-semibold">最初の書き方例</h2>
          <div className="mt-4 grid gap-3 text-sm leading-7 text-[var(--muted)] sm:grid-cols-3">
            <div>
              <div className="font-medium text-[var(--foreground)]">要点</div>
              <p>JWT は、署名付きのデータを使って認証状態を表現する仕組み。</p>
            </div>
            <div>
              <div className="font-medium text-[var(--foreground)]">説明</div>
              <p>
                サーバーは署名を検証することで、トークンが改ざんされていないか確認できる。
              </p>
            </div>
            <div>
              <div className="font-medium text-[var(--foreground)]">つまずき</div>
              <p>Cookie セッションとの使い分けを、まだ自信を持って説明できない。</p>
            </div>
          </div>
        </div>
      </section>

      <NoteForm
        mode="create"
        initialValues={{
          title: "",
          summary: "",
          explanation: "",
          stuckPoints: "",
          nextActions: "",
          body: "",
          tagsText: "",
          status: NoteStatus.DRAFT,
          needsReview: true,
          reviewDueAt: "",
        }}
      />
    </main>
  );
}
