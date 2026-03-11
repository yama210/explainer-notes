type NoteFormHeaderProps = {
  mode: "create" | "edit";
  autosaveState: "idle" | "saving" | "saved" | "error";
};

export function NoteFormHeader({ mode, autosaveState }: NoteFormHeaderProps) {
  return (
    <section className="quiet-panel px-5 py-5 sm:px-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl space-y-2">
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
            {mode === "create" ? "新規作成" : "編集中"}
          </div>
          <h2 className="font-heading text-xl font-semibold text-[var(--foreground)]">
            理解を整理しながら書き進める
          </h2>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            タイトルと要点で全体像を決めてから、自分の言葉での説明、
            つまずき、次にやることを書き足していく構成です。読み返したときに
            迷わないノートになるよう、必要な項目だけを静かに並べています。
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-md bg-[var(--accent-soft)] px-3 py-1.5 font-medium text-[var(--accent)]">
            {mode === "create" ? "新しいノート" : "編集中"}
          </span>
          {mode === "edit" ? (
            <span
              data-testid="autosave-state"
              className={`rounded-md px-3 py-1.5 font-medium ${
                autosaveState === "saving"
                  ? "bg-amber-50 text-amber-700"
                  : autosaveState === "error"
                    ? "bg-red-50 text-red-700"
                    : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {autosaveText(autosaveState)}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function autosaveText(state: "idle" | "saving" | "saved" | "error") {
  if (state === "saving") return "自動保存中";
  if (state === "saved") return "自動保存済み";
  if (state === "error") return "自動保存に失敗";
  return "編集中";
}
