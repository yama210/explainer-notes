"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buildNotesHref } from "@/lib/note-links";
import { noteStatusOptions, sortOptions } from "@/lib/note-status";
import { defaultNoteListQuery, type NoteListQuery } from "@/lib/validation";

type FilterFormProps = {
  filters: NoteListQuery;
  availableTags: Array<{ tag: string; count: number }>;
};

export function FilterForm({ filters, availableTags }: FilterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<NoteListQuery>(filters);

  useEffect(() => {
    setValues(filters);
  }, [filters]);

  function updateField<K extends keyof NoteListQuery>(
    key: K,
    value: NoteListQuery[K],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function navigate(nextFilters: NoteListQuery) {
    const href = buildNotesHref(nextFilters);
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <form
      className="page-section"
      onSubmit={(event) => {
        event.preventDefault();
        navigate(values);
      }}
    >
      <div className="quiet-panel px-5 py-5 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[1.6fr_repeat(4,minmax(0,1fr))]">
          <Field label="キーワード">
            <input
              id="q"
              name="q"
              value={values.q}
              onChange={(event) => updateField("q", event.target.value)}
              placeholder="タイトル、要点、タグで検索"
              className="field-control"
            />
          </Field>

          <SelectField
            label="ステータス"
            name="status"
            value={values.status}
            onChange={(value) =>
              updateField("status", value as NoteListQuery["status"])
            }
            options={[
              { value: "ALL", label: "すべて" },
              ...noteStatusOptions.map((option) => ({
                value: option.value,
                label: option.label,
              })),
            ]}
          />

          <SelectField
            label="タグ"
            name="tag"
            value={values.tag}
            onChange={(value) => updateField("tag", value)}
            options={[
              { value: "", label: "すべてのタグ" },
              ...availableTags.map((option) => ({
                value: option.tag,
                label: `#${option.tag} (${option.count})`,
              })),
            ]}
          />

          <SelectField
            label="復習条件"
            name="review"
            value={values.review}
            onChange={(value) =>
              updateField("review", value as NoteListQuery["review"])
            }
            options={[
              { value: "all", label: "すべて" },
              { value: "needs_review", label: "復習対象のみ" },
              { value: "due_soon", label: "近日中に復習" },
              { value: "overdue", label: "期限切れ" },
            ]}
          />

          <SelectField
            label="並び順"
            name="sort"
            value={values.sort}
            onChange={(value) =>
              updateField("sort", value as NoteListQuery["sort"])
            }
            options={sortOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="action-primary px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            条件を適用
          </button>
          <button
            type="button"
            disabled={isPending}
            className="action-secondary px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => {
              const nextDefaults: NoteListQuery = { ...defaultNoteListQuery };
              setValues(nextDefaults);
              navigate(nextDefaults);
            }}
          >
            リセット
          </button>
        </div>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  children: ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="space-y-2">
      <div className="text-sm text-[var(--muted)]">{label}</div>
      {children}
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  name: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
};

function SelectField({
  label,
  name,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <Field label={label}>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-control"
      >
        {options.map((option) => (
          <option key={`${name}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
