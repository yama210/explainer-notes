"use client";

import { NoteStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { noteStatusOptions } from "@/lib/note-status";
import { type NoteInput, noteInputSchema, parseTagInput } from "@/lib/validation";
import { MarkdownEditorField, type MarkdownTool } from "./markdown-editor-field";
import { NoteFormHeader } from "./note-form-header";
import { NoteFormField, NoteFormSection } from "./note-form-ui";

type NoteFormProps = {
  mode: "create" | "edit";
  noteId?: string;
  initialValues: {
    title: string;
    summary: string;
    explanation: string;
    stuckPoints: string;
    nextActions: string;
    body: string;
    tagsText: string;
    status: NoteStatus;
    needsReview: boolean;
    reviewDueAt: string;
  };
};

type FormErrors = Partial<
  Record<
    | "title"
    | "summary"
    | "explanation"
    | "stuckPoints"
    | "nextActions"
    | "body"
    | "tags"
    | "reviewDueAt",
    string
  >
>;

type ParsedValues =
  | { success: true; data: NoteInput }
  | { success: false; errors: FormErrors };

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
    fallbackSelection: "補足メモ",
  },
] as const;

export function NoteForm({ mode, noteId, initialValues }: NoteFormProps) {
  const router = useRouter();
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autosaveState, setAutosaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >(mode === "edit" ? "saved" : "idle");
  const lastSavedPayloadRef = useRef("");
  const minReviewDate = useMemo(() => getTodayDateString(), []);
  const serialized = useMemo(() => JSON.stringify(values), [values]);

  useEffect(() => {
    setValues(initialValues);
    lastSavedPayloadRef.current = JSON.stringify(initialValues);
  }, [initialValues]);

  useEffect(() => {
    if (mode !== "edit" || !noteId) {
      return;
    }

    if (serialized === lastSavedPayloadRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      const payload = parseValues(values);
      if (!payload.success) {
        setErrors(payload.errors);
        setAutosaveState("error");
        return;
      }

      setErrors({});
      setAutosaveState("saving");

      try {
        const response = await fetch(`/api/notes/${noteId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload.data),
        });

        if (!response.ok) {
          const result = (await response.json()) as { error?: string };
          throw new Error(result.error ?? "自動保存に失敗しました。");
        }

        lastSavedPayloadRef.current = serialized;
        setAutosaveState("saved");
        setSubmitError("");
        router.refresh();
      } catch (cause) {
        setAutosaveState("error");
        setSubmitError(
          cause instanceof Error ? cause.message : "自動保存に失敗しました。",
        );
      }
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [mode, noteId, router, serialized, values]);

  function updateField<K extends keyof typeof values>(
    key: K,
    value: (typeof values)[K],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
    setAutosaveState("idle");
  }

  function insertMarkdown(snippet: string, fallbackSelection = "") {
    const textarea = bodyRef.current;

    if (!textarea) {
      updateField("body", `${values.body}${snippet.replace("__TEXT__", fallbackSelection)}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = values.body.slice(start, end) || fallbackSelection;
    const nextValue =
      values.body.slice(0, start) +
      snippet.replace("__TEXT__", selected) +
      values.body.slice(end);

    updateField("body", nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + snippet.indexOf("__TEXT__") + selected.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    const payload = parseValues(values);
    if (!payload.success) {
      setErrors(payload.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch(
        mode === "create" ? "/api/notes" : `/api/notes/${noteId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload.data),
        },
      );

      const result = (await response.json()) as
        | { id: string; error?: string }
        | { error?: string };

      if (!response.ok || !("id" in result)) {
        throw new Error(result.error ?? "保存に失敗しました。");
      }

      lastSavedPayloadRef.current = JSON.stringify(values);
      startTransition(() => {
        router.push(`/notes/${result.id}`);
        router.refresh();
      });
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : "保存に失敗しました。");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="page-section space-y-8">
      <NoteFormHeader mode={mode} autosaveState={autosaveState} />

      <div className="space-y-6">
        <NoteFormSection
          title="書き出し"
          description="まずは一覧で見返したときに分かる名前と、短い要点から埋めます。"
        >
          <NoteFormField
            label="タイトル"
            error={errors.title}
            description="あとから一覧で探しやすい短い名前にします。"
          >
            <input
              id="title"
              name="title"
              value={values.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="field-control"
              placeholder="例: JWT を自分の言葉で説明する"
            />
          </NoteFormField>

          <NoteFormField
            label="要点"
            error={errors.summary}
            description="このノートを一言で説明するなら何かを書きます。"
          >
            <textarea
              id="summary"
              name="summary"
              value={values.summary}
              onChange={(event) => updateField("summary", event.target.value)}
              rows={4}
              className="field-control min-h-28"
              placeholder="例: JWT は署名付きデータで認証状態を表す仕組み。"
            />
          </NoteFormField>
        </NoteFormSection>

        <NoteFormSection
          title="説明できる形に整える"
          description="自分の言葉で説明し、曖昧な点と次に進むためのメモを残します。"
        >
          <NoteFormField
            label="説明"
            error={errors.explanation}
            description="実際に誰かへ説明するつもりで、自分の言葉に置き換えて書きます。"
          >
            <textarea
              id="explanation"
              name="explanation"
              value={values.explanation}
              onChange={(event) => updateField("explanation", event.target.value)}
              rows={8}
              className="field-control min-h-44"
              placeholder="例: JWT はヘッダー・ペイロード・署名の3つで構成される。サーバーは署名を検証して改ざんの有無を確認する。"
            />
          </NoteFormField>

          <NoteFormField
            label="つまずき・疑問"
            error={errors.stuckPoints}
            description="まだ言い切れない点や、説明しにくかった点を残します。"
          >
            <textarea
              id="stuckPoints"
              name="stuckPoints"
              value={values.stuckPoints}
              onChange={(event) => updateField("stuckPoints", event.target.value)}
              rows={5}
              className="field-control min-h-36"
              placeholder="例: Cookie セッションとの使い分けを、まだ自信を持って説明できない。"
            />
          </NoteFormField>

          <NoteFormField
            label="次にやること"
            error={errors.nextActions}
            description="復習や追加調査のメモを残して、次の行動につなげます。"
          >
            <textarea
              id="nextActions"
              name="nextActions"
              value={values.nextActions}
              onChange={(event) => updateField("nextActions", event.target.value)}
              rows={4}
              className="field-control min-h-28"
              placeholder="例: Refresh Token の役割を別のノートで整理してみる。"
            />
          </NoteFormField>
        </NoteFormSection>

        <NoteFormSection
          title="本文"
          description="自由記述の本文です。Markdown で見出しやコードを混ぜながら整理できます。"
        >
          <MarkdownEditorField
            value={values.body}
            error={errors.body}
            textareaRef={bodyRef}
            tools={markdownTools}
            onChange={(value) => updateField("body", value)}
            onInsertTool={(tool) => insertMarkdown(tool.snippet, tool.fallbackSelection)}
          />
        </NoteFormSection>

        <NoteFormSection
          title="整理のための設定"
          description="理解の段階、タグ、復習設定を整えておくと、あとから探しやすくなります。"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <NoteFormField
              label="ステータス"
              description="いまの理解段階に近い状態を選びます。"
            >
              <select
                id="status"
                name="status"
                value={values.status}
                onChange={(event) =>
                  updateField("status", event.target.value as NoteStatus)
                }
                className="field-control"
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
          description="復習対象にすると、ホームと一覧の復習導線に表示されます。"
        >
          <label className="flex items-start gap-3 rounded-2xl bg-[var(--surface-muted)] px-4 py-4">
            <input
              id="needsReview"
              name="needsReview"
              type="checkbox"
              checked={values.needsReview}
              onChange={(event) => {
                const checked = event.target.checked;
                updateField("needsReview", checked);
                if (checked && !values.reviewDueAt) {
                  updateField("reviewDueAt", minReviewDate);
                }
              }}
              className="mt-1 h-4 w-4"
            />
            <div>
              <div className="font-medium">要復習にする</div>
              <div className="text-sm leading-7 text-[var(--muted)]">
                復習予定日を設定すると、ダッシュボードと一覧で見返しやすくなります。
              </div>
            </div>
          </label>

          <NoteFormField
            label="復習予定日"
            error={errors.reviewDueAt}
            description="今日以降の日付を選ぶと、ホームの復習一覧に表示されます。"
          >
            <input
              id="reviewDueAt"
              name="reviewDueAt"
              type="date"
              value={values.reviewDueAt}
              min={minReviewDate}
              onChange={(event) => updateField("reviewDueAt", event.target.value)}
              className="field-control"
            />
          </NoteFormField>
        </NoteFormSection>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="action-secondary px-5 py-3"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="action-primary px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "保存中..."
              : mode === "create"
                ? "ノートを作成する"
                : "保存して詳細へ戻る"}
          </button>
        </div>

        {submitError ? (
          <p className="rounded-2xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
            {submitError}
          </p>
        ) : null}
      </div>
    </form>
  );
}

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseValues(values: NoteFormProps["initialValues"]): ParsedValues {
  const rawPayload = {
    title: values.title,
    summary: values.summary,
    explanation: values.explanation,
    stuckPoints: values.stuckPoints,
    nextActions: values.nextActions,
    body: values.body,
    tags: parseTagInput(values.tagsText),
    status: values.status,
    needsReview: values.needsReview,
    reviewDueAt: values.reviewDueAt || null,
  };

  const parsed = noteInputSchema.safeParse(rawPayload);

  if (parsed.success) {
    return {
      success: true,
      data: parsed.data satisfies NoteInput,
    };
  }

  const fieldErrors = parsed.error.flatten().fieldErrors;

  return {
    success: false,
    errors: {
      title: fieldErrors.title?.[0],
      summary: fieldErrors.summary?.[0],
      explanation: fieldErrors.explanation?.[0],
      stuckPoints: fieldErrors.stuckPoints?.[0],
      nextActions: fieldErrors.nextActions?.[0],
      body: fieldErrors.body?.[0],
      tags: fieldErrors.tags?.[0],
      reviewDueAt: fieldErrors.reviewDueAt?.[0],
    },
  };
}
