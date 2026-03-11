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
        <div className="grid items-end gap-4 lg:grid-cols-[1.6fr_repeat(4,minmax(0,1fr))]">
          <Field label="キーワード">
            <input
              id="q"
              name="q"
              value={values.q}
              onChange={(event) => updateField("q", event.target.value)}
              placeholder="タイトル、本文、タグで検索"
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
            label="復習"
            name="review"
            value={values.review}
            onChange={(value) =>
              updateField("review", value as NoteListQuery["review"])
            }
            options={[
              { value: "all", label: "すべて" },
              { value: "needs_review", label: "要復習" },
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

        <div className="mt-5 flex flex-wrap gap-3 border-t border-[var(--line-light)] pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="action-primary px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            検索する
          </button>
          <button
            type="button"
            disabled={isPending}
            className="action-secondary px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
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
    <label className="block space-y-1.5">
      <div className="text-xs font-medium text-[var(--muted)]">{label}</div>
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
        className="field-control cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.65rem_0.65rem] bg-[right_0.75rem_center] bg-no-repeat pr-8"
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
