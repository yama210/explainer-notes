"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { buildNoteDetailHref } from "@/lib/note-links";
import type { RelatedNotePreset } from "@/lib/notes";
import { cn } from "@/lib/utils";

type RelatedPresetControlsProps = {
  noteId: string;
  currentPreset: RelatedNotePreset;
};

const STORAGE_KEY = "explainer-notes:related-preset";

const presetLabels: Record<RelatedNotePreset, string> = {
  balanced: "バランス",
  tag_focused: "タグ重視",
  concept_focused: "説明文重視",
};

export function RelatedPresetControls({
  noteId,
  currentPreset,
}: RelatedPresetControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigateToPreset(preset: RelatedNotePreset) {
    localStorage.setItem(STORAGE_KEY, preset);
    router.push(
      buildNoteDetailHref(noteId, {
        relatedPreset: preset,
      }),
    );
  }

  useEffect(() => {
    const explicitPreset = searchParams.get("related");

    if (explicitPreset) {
      localStorage.setItem(STORAGE_KEY, explicitPreset);
      return;
    }

    const storedPreset = localStorage.getItem(STORAGE_KEY);
    if (
      storedPreset &&
      (storedPreset === "balanced" ||
        storedPreset === "tag_focused" ||
        storedPreset === "concept_focused") &&
      storedPreset !== currentPreset
    ) {
      router.replace(
        buildNoteDetailHref(noteId, {
          relatedPreset: storedPreset,
        }),
      );
      return;
    }

    localStorage.setItem(STORAGE_KEY, currentPreset);
  }, [currentPreset, noteId, router, searchParams]);

  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-[var(--line-light)] bg-[var(--surface)] p-1 text-sm">
      {(Object.keys(presetLabels) as RelatedNotePreset[]).map((preset) => {
        const isActive = preset === currentPreset;
        return (
          <button
            key={preset}
            type="button"
            onClick={() => navigateToPreset(preset)}
            className={cn(
              "rounded-md px-3 py-1.5 font-medium transition-colors",
              isActive
                ? "bg-white text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            {presetLabels[preset]}
          </button>
        );
      })}
    </div>
  );
}
