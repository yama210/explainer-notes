import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import { buildNoteDetailHref } from "@/lib/note-links";
import type { RelatedNotePreset } from "@/lib/notes";
import type { RevisionDiffItem } from "@/lib/note-helpers";
import type { NoteRevisionItem } from "@/lib/notes";
import { RestoreRevisionButton } from "./restore-revision-button";

type RevisionHistoryPanelProps = {
  noteId: string;
  revisions: NoteRevisionItem[];
  selectedRevision: NoteRevisionItem | null;
  revisionDiff: RevisionDiffItem[];
  relatedPreset: RelatedNotePreset;
  restoredFrom?: string;
};

export function RevisionHistoryPanel({
  noteId,
  revisions,
  selectedRevision,
  revisionDiff,
  relatedPreset,
  restoredFrom,
}: RevisionHistoryPanelProps) {
  return (
    <div className="quiet-panel px-5 py-5 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-[var(--muted)]">保存履歴</h2>
        {selectedRevision ? (
          <RestoreRevisionButton noteId={noteId} revisionId={selectedRevision.id} />
        ) : null}
      </div>

      {restoredFrom ? (
        <p className="mt-4 rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--accent)]">
          現在のノートは、この履歴をもとに復元されています。
        </p>
      ) : null}

      {revisions.length > 0 ? (
        <div className="mt-4 space-y-3">
          {revisions.map((revision, index) => {
            const isSelected = selectedRevision?.id === revision.id;
            const isRestoredSource = restoredFrom === revision.id;

            return (
              <Link
                key={revision.id}
                href={buildNoteDetailHref(noteId, {
                  revisionId: revision.id,
                  relatedPreset,
                  restoredFrom,
                })}
                className={`block rounded-2xl px-4 py-3 transition ${
                  isSelected
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "bg-[var(--surface-muted)] hover:bg-[var(--accent-soft)]"
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span>{index === 0 ? "最新の保存" : `保存履歴 ${revisions.length - index}`}</span>
                  <span>{formatDateTime(revision.createdAt)}</span>
                </div>
                {isRestoredSource ? (
                  <div className="mt-2 text-xs">この版をもとに復元しました</div>
                ) : null}
                {index === 0 ? (
                  <div className="mt-2 text-xs">現在のノート内容に最も近い版です</div>
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          まだ保存履歴はありません。
        </p>
      )}

      {selectedRevision ? (
        <div className="mt-5 space-y-3 rounded-2xl bg-[var(--surface-muted)] px-4 py-4">
          <div className="text-sm font-medium">選択中の版</div>
          <div className="text-sm text-[var(--muted)]">
            {formatDateTime(selectedRevision.createdAt)} に保存
          </div>
          {revisionDiff.length > 0 ? (
            <div className="space-y-3 pt-1">
              {revisionDiff.map((item) => (
                <div key={item.label} className="rounded-2xl bg-white px-4 py-3">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="mt-2 grid gap-2 text-sm text-[var(--muted)]">
                    <div>変更前: {item.before}</div>
                    <div>変更後: {item.after}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-7 text-[var(--muted)]">
              ひとつ前の版との差分はありません。
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
