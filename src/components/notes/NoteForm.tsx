"use client";

import { useActionState, useMemo, useState } from "react";
import {
  NOTE_TYPES,
  NOTE_TYPE_LABELS,
  SUBJECTS,
  SUBJECT_LABELS,
  TEMPLATE_FIELDS,
  type NoteType,
  type Subject,
} from "@/lib/note-template";

type NoteFormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
};

type NoteFormAction = (
  state: NoteFormState,
  formData: FormData,
) => Promise<NoteFormState>;

type NoteFormProps = {
  action: NoteFormAction;
  submitLabel: string;
  initialData?: {
    title: string;
    noteType: NoteType;
    subject: Subject;
    tagsText: string;
    fields: Record<string, string>;
  };
};

const initialState: NoteFormState = {};

function ErrorText({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;
  return <p className="text-sm text-rose-600">{errors[0]}</p>;
}

export function NoteForm({ action, submitLabel, initialData }: NoteFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [selectedNoteType, setSelectedNoteType] = useState<NoteType>(
    initialData?.noteType ?? "concept",
  );
  const templateFields = useMemo(
    () => TEMPLATE_FIELDS[selectedNoteType],
    [selectedNoteType],
  );

  return (
    <form action={formAction} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-semibold text-slate-800">
          タイトル
        </label>
        <input
          id="title"
          name="title"
          defaultValue={initialData?.title ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-200 focus:ring-2"
          placeholder="例: useEffectの依存配列とは？"
        />
        <ErrorText errors={state.errors?.title} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="noteType" className="text-sm font-semibold text-slate-800">
            テンプレート
          </label>
          <select
            id="noteType"
            name="noteType"
            value={selectedNoteType}
            onChange={(event) => setSelectedNoteType(event.target.value as NoteType)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-200 focus:ring-2"
          >
            {NOTE_TYPES.map((type) => (
              <option key={type} value={type}>
                {NOTE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <ErrorText errors={state.errors?.noteType} />
        </div>

        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-semibold text-slate-800">
            分野
          </label>
          <select
            id="subject"
            name="subject"
            defaultValue={initialData?.subject ?? "programming"}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-200 focus:ring-2"
          >
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {SUBJECT_LABELS[subject]}
              </option>
            ))}
          </select>
          <ErrorText errors={state.errors?.subject} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="tags" className="text-sm font-semibold text-slate-800">
          タグ（カンマ区切り）
        </label>
        <input
          id="tags"
          name="tags"
          defaultValue={initialData?.tagsText ?? ""}
          placeholder="react, hooks, state"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-200 focus:ring-2"
        />
        <ErrorText errors={state.errors?.tags} />
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-800">
          {NOTE_TYPE_LABELS[selectedNoteType]}の入力項目
        </p>
        {templateFields.map((field) => {
          const initialFieldValue =
            initialData && selectedNoteType === initialData.noteType
              ? initialData.fields[field.key] ?? ""
              : "";

          return (
            <div key={`${selectedNoteType}-${field.key}`} className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor={`field_${field.key}`}>
                {field.label}
              </label>
              <textarea
                id={`field_${field.key}`}
                name={`field_${field.key}`}
                defaultValue={initialFieldValue}
                rows={field.rows ?? 3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-200 focus:ring-2"
              />
            </div>
          );
        })}
        <ErrorText errors={state.errors?.content} />
      </div>

      {state.message ? <p className="text-sm text-rose-600">{state.message}</p> : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "保存中..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
