type NoteFormHeaderProps = {
  mode: "create" | "edit";
  autosaveState: "idle" | "saving" | "saved" | "error";
};

export function NoteFormHeader({ mode, autosaveState }: NoteFormHeaderProps) {
  return (
    <section className="quiet-panel px-5 py-5 sm:px-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl space-y-2">
          <div className="text-sm text-[var(--muted)]">
            {mode === "create" ? "作成モード" : "編集中"}
          </div>
          <h2 className="text-xl font-semibold tracking-[-0.02em]">書き進め方の目安</h2>
          <p className="text-sm leading-8 text-[var(--muted)]">
            タイトルと要点で輪郭を決めてから、説明、つまずき、次にやることを順に足すと、
            後から読んだときに理解の流れを追いやすくなります。
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-[var(--muted)]">
          <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5">
            {mode === "create" ? "新規作成" : "編集"}
          </span>
          {mode === "edit" ? (
            <span
              data-testid="autosave-state"
              className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5"
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
