"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { buildNoteDetailHref } from "@/lib/note-links";
import type { RelatedNotePreset } from "@/lib/notes";

type RelatedPresetControlsProps = {
  noteId: string;
  currentPreset: RelatedNotePreset;
  revisionId?: string;
  restoredFrom?: string;
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
  revisionId,
  restoredFrom,
}: RelatedPresetControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
          revisionId,
          relatedPreset: storedPreset,
          restoredFrom,
        }),
      );
      return;
    }

    localStorage.setItem(STORAGE_KEY, currentPreset);
  }, [currentPreset, noteId, restoredFrom, revisionId, router, searchParams]);

  return (
    <div className="flex flex-wrap gap-2 text-sm">
      {(Object.keys(presetLabels) as RelatedNotePreset[]).map((preset) => {
        const isActive = preset === currentPreset;
        return (
          <Link
            key={preset}
            href={buildNoteDetailHref(noteId, {
              revisionId,
              relatedPreset: preset,
              restoredFrom,
            })}
            onClick={() => localStorage.setItem(STORAGE_KEY, preset)}
            className={`rounded-full px-3 py-1.5 transition ${
              isActive
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "bg-[var(--surface-muted)] text-[var(--muted)] hover:text-[var(--accent)]"
            }`}
          >
            {presetLabels[preset]}
          </Link>
        );
      })}
    </div>
  );
}
