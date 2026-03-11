import type { MutableRefObject } from "react";
import { MarkdownViewer } from "./markdown-viewer";
import { NoteFormField, ToolbarButton } from "./note-form-ui";

export type MarkdownTool = {
  label: string;
  ariaLabel: string;
  snippet: string;
  fallbackSelection: string;
};

type MarkdownEditorFieldProps = {
  value: string;
  error?: string;
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>;
  tools: readonly MarkdownTool[];
  onChange: (value: string) => void;
  onInsertTool: (tool: MarkdownTool) => void;
};

export function MarkdownEditorField({
  value,
  error,
  textareaRef,
  tools,
  onChange,
  onInsertTool,
}: MarkdownEditorFieldProps) {
  return (
    <>
      <div className="space-y-3 rounded-lg border border-[var(--line-light)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p>Markdown で入力すると、右側にプレビューが表示されます。</p>
          <span className="font-mono text-xs text-[var(--accent)]">
            {value.length.toLocaleString("ja-JP")} 文字
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <ToolbarButton
              key={tool.ariaLabel}
              ariaLabel={tool.ariaLabel}
              onClick={() => onInsertTool(tool)}
            >
              {tool.label}
            </ToolbarButton>
          ))}
        </div>
        <p className="text-xs text-[var(--muted)]">
          見出しは <code className="rounded bg-[var(--surface-muted)] px-1">#</code>、
          箇条書きは <code className="rounded bg-[var(--surface-muted)] px-1">-</code>、
          コードブロックは{" "}
          <code className="rounded bg-[var(--surface-muted)] px-1">```</code>
          で入力できます。
        </p>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <NoteFormField
          label="本文を入力"
          error={error}
          description="説明の補足、コード、引用したメモなどを自由に書けます。"
        >
          <textarea
            id="body"
            name="body"
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={18}
            className="field-control min-h-[420px] font-mono text-sm"
            placeholder={
              "## 要点\n\n- 分かったこと\n- まだ曖昧なこと\n\n```ts\nconsole.log('markdown');\n```"
            }
          />
        </NoteFormField>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-[var(--foreground)]">
                プレビュー
              </div>
              <p className="text-sm text-[var(--muted)]">
                入力した内容がそのまま表示されます。
              </p>
            </div>
            <span className="rounded-md bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
              Live
            </span>
          </div>
          <div className="quiet-panel min-h-[420px] px-5 py-5">
            <MarkdownViewer content={value} />
          </div>
        </div>
      </div>
    </>
  );
}
