import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownViewerProps = {
  content: string;
};

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  if (!content.trim()) {
    return (
      <p className="text-sm leading-7 text-[var(--muted)]">
        まだ本文は入力されていません。
      </p>
    );
  }

  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
