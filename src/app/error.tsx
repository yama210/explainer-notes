"use client";

type ErrorProps = {
  error: Error;
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="page-section">
      <div className="quiet-panel max-w-2xl px-6 py-10 sm:px-8">
        <p className="text-sm text-[var(--muted)]">Error</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
          画面の読み込みに失敗しました
        </h1>
        <p className="mt-4 text-sm leading-8 text-[var(--muted)]">
          {error.message || "時間をおいてからもう一度お試しください。"}
        </p>
        <button type="button" onClick={reset} className="action-primary mt-6 px-5 py-3">
          もう一度試す
        </button>
      </div>
    </div>
  );
}
