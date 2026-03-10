import { NoteStatus } from "@prisma/client";
import { noteStatusMeta } from "./note-status";
import type { NoteListRecord } from "./note-repository";

export type RelatedNoteWeights = {
  tagWeight: number;
  titleWeight: number;
  summaryWeight: number;
  explanationWeight: number;
  statusWeight: number;
};

export type RelatedNotePreset = "balanced" | "tag_focused" | "concept_focused";

export type RelatedNoteMatch = {
  note: NoteListRecord;
  reasons: string[];
  score: number;
};

type RelatedBase = Pick<
  NoteListRecord,
  "title" | "summary" | "explanation" | "tags" | "status"
>;

export const relatedNoteWeightPresets: Record<RelatedNotePreset, RelatedNoteWeights> = {
  balanced: {
    tagWeight: 4,
    titleWeight: 3,
    summaryWeight: 2,
    explanationWeight: 2,
    statusWeight: 1,
  },
  tag_focused: {
    tagWeight: 6,
    titleWeight: 2,
    summaryWeight: 1,
    explanationWeight: 1,
    statusWeight: 1,
  },
  concept_focused: {
    tagWeight: 3,
    titleWeight: 4,
    summaryWeight: 3,
    explanationWeight: 3,
    statusWeight: 1,
  },
};

export function parseRelatedNotePreset(value: string | undefined): RelatedNotePreset {
  if (value === "tag_focused" || value === "concept_focused") {
    return value;
  }

  return "balanced";
}

export function resolveRelatedNoteWeights(
  preset: RelatedNotePreset,
  overrides?: Partial<RelatedNoteWeights>,
) {
  return {
    ...relatedNoteWeightPresets[preset],
    ...overrides,
  };
}

export function matchRelatedNotes(
  note: RelatedBase,
  candidates: NoteListRecord[],
  limit: number,
  weights: RelatedNoteWeights = relatedNoteWeightPresets.balanced,
) {
  const noteTags = new Set(note.tags.map((tag) => tag.toLowerCase()));
  const noteKeywords = extractKeywords(
    `${note.title} ${note.summary} ${note.explanation}`.toLowerCase(),
  );

  return candidates
    .map((candidate) => {
      const candidateTags = new Set(candidate.tags.map((tag) => tag.toLowerCase()));
      const sharedTags = Array.from(noteTags).filter((tag) => candidateTags.has(tag));
      const candidateTitleKeywords = extractKeywords(candidate.title.toLowerCase());
      const candidateSummaryKeywords = extractKeywords(candidate.summary.toLowerCase());
      const candidateExplanationKeywords = extractKeywords(candidate.explanation.toLowerCase());
      const titleHits = overlapValues(noteKeywords, candidateTitleKeywords);
      const summaryHits = overlapValues(noteKeywords, candidateSummaryKeywords);
      const explanationHits = overlapValues(noteKeywords, candidateExplanationKeywords);
      const sameStatus = candidate.status === note.status ? 1 : 0;

      const score =
        sharedTags.length * weights.tagWeight +
        titleHits.length * weights.titleWeight +
        summaryHits.length * weights.summaryWeight +
        explanationHits.length * weights.explanationWeight +
        sameStatus * weights.statusWeight;

      return {
        note: candidate,
        score,
        sharedTagCount: sharedTags.length,
        reasons: buildRelatedReasons({
          sharedTags,
          titleHits,
          summaryHits,
          explanationHits,
          sameStatus: sameStatus === 1,
          candidateStatus: candidate.status,
        }),
      } satisfies RelatedNoteMatch & { sharedTagCount: number };
    })
    .filter((match) => match.score > 0 || match.sharedTagCount > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.sharedTagCount - a.sharedTagCount ||
        b.note.updatedAt.getTime() - a.note.updatedAt.getTime(),
    )
    .slice(0, limit)
    .map((match) => ({
      note: match.note,
      reasons: match.reasons,
      score: match.score,
    }));
}

function buildRelatedReasons(input: {
  sharedTags: string[];
  titleHits: string[];
  summaryHits: string[];
  explanationHits: string[];
  sameStatus: boolean;
  candidateStatus: NoteStatus;
}) {
  const reasons: string[] = [];

  if (input.sharedTags.length > 0) {
    reasons.push(`共通タグ: ${input.sharedTags.slice(0, 2).join(", ")}`);
  }

  if (input.titleHits.length > 0) {
    reasons.push(`タイトルに共通語: ${input.titleHits.slice(0, 2).join(", ")}`);
  }

  if (input.summaryHits.length > 0) {
    reasons.push(`要点に共通語: ${input.summaryHits.slice(0, 2).join(", ")}`);
  }

  if (input.explanationHits.length > 0) {
    reasons.push(`説明文に共通語: ${input.explanationHits.slice(0, 2).join(", ")}`);
  }

  if (input.sameStatus) {
    reasons.push(`理解段階が近い: ${noteStatusMeta[input.candidateStatus].label}`);
  }

  return reasons.slice(0, 3);
}

function extractKeywords(text: string) {
  return Array.from(
    new Set((text.match(/[\p{L}\p{N}]{2,}/gu) ?? []).map((token) => token.toLowerCase())),
  ).slice(0, 24);
}

function overlapValues(left: string[], right: string[]) {
  const rightSet = new Set(right);
  return left.filter((value) => rightSet.has(value));
}
