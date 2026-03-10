"use client";

type ErrorProps = {
  error: Error;
  reset: () => void;
};

export default function NotesError({ error, reset }: ErrorProps) {
  return (
    <div className="page-section">
      <div className="quiet-panel max-w-2xl px-6 py-10 sm:px-8">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">
          ノート一覧を読み込めませんでした
        </h1>
        <p className="mt-4 text-sm leading-8 text-[var(--muted)]">
          {error.message || "DB 接続や検索条件の読み込みに失敗した可能性があります。"}
        </p>
        <button type="button" onClick={reset} className="action-primary mt-6 px-5 py-3">
          再読み込み
        </button>
      </div>
    </div>
  );
}
