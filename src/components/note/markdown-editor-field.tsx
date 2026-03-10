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
      <div className="space-y-4 rounded-2xl bg-[var(--surface-muted)] px-4 py-4 text-sm text-[var(--muted)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p>Markdown で入力すると、右側にライブプレビューが表示されます。</p>
          <span>{value.length.toLocaleString("ja-JP")} 文字</span>
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
        <p className="text-xs leading-6">
          見出しは <code>#</code>、箇条書きは <code>-</code>、コードブロックは{" "}
          <code>```</code> で書けます。
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <NoteFormField
          label="本文を入力"
          error={error}
          description="説明の補足、コード、引用メモなどを自由に残せます。"
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
              "## 要点\n\n- 何を理解したか\n- どこが難しかったか\n\n```ts\nconsole.log('markdown');\n```"
            }
          />
        </NoteFormField>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">プレビュー</div>
              <p className="text-sm leading-7 text-[var(--muted)]">
                書いた内容がどのように読まれるかを、その場で確認できます。
              </p>
            </div>
            <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs text-[var(--muted)]">
              Live Preview
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
