"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, type MouseEvent } from "react";
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

function isRelatedNotePreset(value: string | null): value is RelatedNotePreset {
  return (
    value === "balanced" ||
    value === "tag_focused" ||
    value === "concept_focused"
  );
}

function shouldHandleClientNavigation(event: MouseEvent<HTMLAnchorElement>) {
  return !(
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

function getPresetHref(noteId: string, preset: RelatedNotePreset) {
  return buildNoteDetailHref(noteId, {
    relatedPreset: preset,
  });
}

export function RelatedPresetControls({
  noteId,
  currentPreset,
}: RelatedPresetControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitPreset = searchParams.get("related");

  function handlePresetNavigation(
    event: MouseEvent<HTMLAnchorElement>,
    preset: RelatedNotePreset,
    href: string,
  ) {
    localStorage.setItem(STORAGE_KEY, preset);

    if (!shouldHandleClientNavigation(event)) {
      return;
    }

    event.preventDefault();
    router.push(href);
  }

  useEffect(() => {
    if (explicitPreset) {
      localStorage.setItem(STORAGE_KEY, explicitPreset);
      return;
    }

    const storedPreset = localStorage.getItem(STORAGE_KEY);
    if (
      isRelatedNotePreset(storedPreset) &&
      storedPreset !== currentPreset
    ) {
      router.replace(getPresetHref(noteId, storedPreset));
      return;
    }

    localStorage.setItem(STORAGE_KEY, currentPreset);
  }, [currentPreset, explicitPreset, noteId, router]);

  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-[var(--line-light)] bg-[var(--surface)] p-1 text-sm">
      {(Object.keys(presetLabels) as RelatedNotePreset[]).map((preset) => {
        const isActive = preset === currentPreset;
        const href = getPresetHref(noteId, preset);

        return (
          <Link
            key={preset}
            href={href}
            onClick={(event) => handlePresetNavigation(event, preset, href)}
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
