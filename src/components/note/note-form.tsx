"use client";

import { NoteStatus } from "@prisma/client";
import { type NoteFormValues } from "@/lib/note-form-values";
import { noteStatusOptions } from "@/lib/note-status";
import { MarkdownEditorField, type MarkdownTool } from "./markdown-editor-field";
import { NoteFormHeader } from "./note-form-header";
import { NoteFormField, NoteFormSection } from "./note-form-ui";
import { type NoteFormMode, useNoteForm } from "./use-note-form";

type NoteFormProps = {
  mode: NoteFormMode;
  noteId?: string;
  initialValues: NoteFormValues;
};

const markdownTools: readonly MarkdownTool[] = [
  {
    label: "見出し",
    ariaLabel: "insert-heading",
    snippet: "## __TEXT__",
    fallbackSelection: "見出し",
  },
  {
    label: "箇条書き",
    ariaLabel: "insert-list",
    snippet: "- __TEXT__",
    fallbackSelection: "ポイント",
  },
  {
    label: "コード",
    ariaLabel: "insert-code",
    snippet: "```ts\n__TEXT__\n```",
    fallbackSelection: "console.log('code');",
  },
  {
    label: "引用",
    ariaLabel: "insert-quote",
    snippet: "> __TEXT__",
    fallbackSelection: "引用メモ",
  },
] as const;

export function NoteForm({ mode, noteId, initialValues }: NoteFormProps) {
  const {
    autosaveState,
    bodyRef,
    errors,
    goBack,
    handleReviewToggle,
    handleSubmit,
    insertMarkdown,
    isSubmitting,
    minReviewDate,
    submitError,
    updateField,
    values,
  } = useNoteForm({
    mode,
    noteId,
    initialValues,
  });

  return (
    <form onSubmit={handleSubmit} className="page-section space-y-10">
      <NoteFormHeader mode={mode} autosaveState={autosaveState} />

      <div className="space-y-8">
        <NoteFormSection
          title="ノートの概要"
          description="最初にタイトルと要点を決めると、あとから書き足す内容の軸がぶれにくくなります。"
        >
          <NoteFormField
            label="タイトル"
            error={errors.title}
            description="あとから見返したときに内容を思い出せる短い題名にします。"
          >
            <input
              id="title"
              name="title"
              value={values.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="field-control text-lg font-medium"
              placeholder="例: JWT を自分の言葉で説明する"
            />
          </NoteFormField>

          <NoteFormField
            label="要点"
            error={errors.summary}
            description="このノートで一番大事なことを短くまとめます。"
          >
            <textarea
              id="summary"
              name="summary"
              value={values.summary}
              onChange={(event) => updateField("summary", event.target.value)}
              rows={4}
              className="field-control min-h-28"
              placeholder="例: JWT は認証情報を安全に受け渡すためのトークンで、署名によって改ざんを検知できる。"
            />
          </NoteFormField>
        </NoteFormSection>

        <NoteFormSection
          title="理解を整理する"
          description="自分の言葉で説明し、詰まった点と次にやることまで並べると、復習しやすいノートになります。"
        >
          <NoteFormField
            label="自分の言葉での説明"
            error={errors.explanation}
            description="他の人に説明するつもりで、できるだけ平易な言葉で書きます。"
          >
            <textarea
              id="explanation"
              name="explanation"
              value={values.explanation}
              onChange={(event) =>
                updateField("explanation", event.target.value)
              }
              rows={8}
              className="field-control min-h-44"
              placeholder="例: JWT はヘッダー、ペイロード、署名の3つで構成される。サーバーは署名を検証して、トークンが改ざんされていないかを確かめる。"
            />
          </NoteFormField>

          <NoteFormField
            label="つまずき・疑問"
            error={errors.stuckPoints}
            description="まだ曖昧なところや、追加で調べたい点を残します。"
          >
            <textarea
              id="stuckPoints"
              name="stuckPoints"
              value={values.stuckPoints}
              onChange={(event) =>
                updateField("stuckPoints", event.target.value)
              }
              rows={5}
              className="field-control min-h-36"
              placeholder="例: Cookie と Authorization ヘッダーの使い分けがまだ整理できていない。"
            />
          </NoteFormField>

          <NoteFormField
            label="次にやること"
            error={errors.nextActions}
            description="次回の復習や追加調査につなげるメモを書きます。"
          >
            <textarea
              id="nextActions"
              name="nextActions"
              value={values.nextActions}
              onChange={(event) =>
                updateField("nextActions", event.target.value)
              }
              rows={4}
              className="field-control min-h-28"
              placeholder="例: Refresh Token の役割を別ノートにまとめて、JWT との関係を整理する。"
            />
          </NoteFormField>
        </NoteFormSection>

        <NoteFormSection
          title="本文"
          description="自由記述の補足メモです。Markdown を使って見出しやコードも整理できます。"
        >
          <MarkdownEditorField
            value={values.body}
            error={errors.body}
            textareaRef={bodyRef}
            tools={markdownTools}
            onChange={(value) => updateField("body", value)}
            onInsertTool={(tool) =>
              insertMarkdown(tool.snippet, tool.fallbackSelection)
            }
          />
        </NoteFormSection>

        <NoteFormSection
          title="見返しやすくする設定"
          description="ステータスとタグを整えると、一覧や検索で見つけやすくなります。"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <NoteFormField
              label="ステータス"
              description="いまの理解度に近い状態を選びます。"
            >
              <select
                id="status"
                name="status"
                value={values.status}
                onChange={(event) =>
                  updateField("status", event.target.value as NoteStatus)
                }
                className="field-control cursor-pointer"
              >
                {noteStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </NoteFormField>

            <NoteFormField
              label="タグ"
              error={errors.tags}
              description="カンマ区切りで入力します。"
            >
              <input
                id="tags"
                name="tags"
                value={values.tagsText}
                onChange={(event) => updateField("tagsText", event.target.value)}
                className="field-control"
                placeholder="auth, web, security"
              />
            </NoteFormField>
          </div>
        </NoteFormSection>

        <NoteFormSection
          title="復習の設定"
          description="あとで見返したいノートは復習対象にして、日付を決めておきます。"
        >
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-md border px-4 py-4 transition-colors ${
              values.needsReview
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--line)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            <input
              id="needsReview"
              name="needsReview"
              type="checkbox"
              checked={values.needsReview}
              onChange={(event) => handleReviewToggle(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--line)] accent-[var(--accent)]"
            />
            <div>
              <div className="font-medium text-[var(--foreground)]">
                復習対象にする
              </div>
              <div className="mt-0.5 text-sm text-[var(--muted)]">
                復習予定日を決めて、ホームと一覧から見つけやすくします。
              </div>
            </div>
          </label>

          <NoteFormField
            label="復習予定日"
            error={errors.reviewDueAt}
            description="今日以降の日付を選ぶと、ホームや一覧で復習日を確認できます。"
          >
            <input
              id="reviewDueAt"
              name="reviewDueAt"
              type="date"
              value={values.reviewDueAt}
              min={minReviewDate}
              onChange={(event) => updateField("reviewDueAt", event.target.value)}
              className="field-control md:w-1/2"
            />
          </NoteFormField>
        </NoteFormSection>

        <div className="flex flex-col gap-3 border-t border-[var(--line-light)] pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={goBack}
            className="action-secondary px-6 py-2.5"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="action-primary px-6 py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "保存中..."
              : mode === "create"
                ? "ノートを作成する"
                : "保存して詳細へ戻る"}
          </button>
        </div>

        {submitError ? (
          <p className="rounded-md bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
            {submitError}
          </p>
        ) : null}
      </div>
    </form>
  );
}
