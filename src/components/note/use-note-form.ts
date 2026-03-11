"use client";

import { useRouter } from "next/navigation";
import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { type NoteFormValues } from "@/lib/note-form-values";
import { type NoteInput, noteInputSchema, parseTagInput } from "@/lib/validation";

export type NoteFormMode = "create" | "edit";

export type NoteFormErrors = Partial<
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

export type NoteFormAutosaveState = "idle" | "saving" | "saved" | "error";

type ParsedValues =
  | { success: true; data: NoteInput }
  | { success: false; errors: NoteFormErrors };

type UseNoteFormArgs = {
  mode: NoteFormMode;
  noteId?: string;
  initialValues: NoteFormValues;
};

export function useNoteForm({ mode, noteId, initialValues }: UseNoteFormArgs) {
  const router = useRouter();
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<NoteFormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autosaveState, setAutosaveState] = useState<NoteFormAutosaveState>(
    mode === "edit" ? "saved" : "idle",
  );
  const lastSavedPayloadRef = useRef(JSON.stringify(initialValues));
  const minReviewDate = useMemo(() => getTodayDateString(), []);
  const serialized = useMemo(() => JSON.stringify(values), [values]);

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
        await submitNoteRequest({
          url: `/api/notes/${noteId}`,
          method: "PATCH",
          data: payload.data,
          fallbackError: "自動保存に失敗しました。",
        });

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

  function updateField<K extends keyof NoteFormValues>(
    key: K,
    value: NoteFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
    setAutosaveState("idle");
  }

  function handleReviewToggle(checked: boolean) {
    updateField("needsReview", checked);
    if (checked && !values.reviewDueAt) {
      updateField("reviewDueAt", minReviewDate);
    }
  }

  function insertMarkdown(snippet: string, fallbackSelection = "") {
    const textarea = bodyRef.current;

    if (!textarea) {
      updateField(
        "body",
        `${values.body}${snippet.replace("__TEXT__", fallbackSelection)}`,
      );
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      const result = await submitNoteRequest<{ id: string }>({
        url: mode === "create" ? "/api/notes" : `/api/notes/${noteId}`,
        method: mode === "create" ? "POST" : "PATCH",
        data: payload.data,
        fallbackError: "保存に失敗しました。",
      });

      lastSavedPayloadRef.current = JSON.stringify(values);
      startTransition(() => {
        router.push(`/notes/${result.id}`);
        router.refresh();
      });
    } catch (cause) {
      setSubmitError(
        cause instanceof Error ? cause.message : "保存に失敗しました。",
      );
      setIsSubmitting(false);
    }
  }

  function goBack() {
    router.back();
  }

  return {
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
  };
}

async function submitNoteRequest<T>({
  url,
  method,
  data,
  fallbackError,
}: {
  url: string;
  method: "POST" | "PATCH";
  data: NoteInput;
  fallbackError: string;
}) {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(result.error ?? fallbackError);
  }

  return result;
}

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseValues(values: NoteFormValues): ParsedValues {
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
