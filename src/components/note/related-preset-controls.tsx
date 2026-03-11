"use client";

import Link from "next/link";
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
          <Link
            key={preset}
            href={buildNoteDetailHref(noteId, {
              relatedPreset: preset,
            })}
            onClick={() => localStorage.setItem(STORAGE_KEY, preset)}
            className={cn(
              "rounded-md px-3 py-1.5 font-medium transition-colors",
              isActive
                ? "bg-white text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            {presetLabels[preset]}
          </Link>
        );
      })}
    </div>
  );
}
