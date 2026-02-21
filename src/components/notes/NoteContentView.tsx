import { parseTemplateContent } from "@/lib/note-content";
import { TEMPLATE_FIELDS, type NoteType } from "@/lib/note-template";

type NoteContentViewProps = {
  noteType: NoteType;
  content: string;
};

export function NoteContentView({ noteType, content }: NoteContentViewProps) {
  const parsed = parseTemplateContent(noteType, content);

  if (!parsed) {
    return (
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">内容</h2>
        <pre className="whitespace-pre-wrap text-sm text-slate-700">{content}</pre>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      {TEMPLATE_FIELDS[noteType].map((field) => (
        <div key={field.key} className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-700">{field.label}</h3>
          <p className="whitespace-pre-wrap text-slate-900">
            {parsed[field.key] || "（未入力）"}
          </p>
        </div>
      ))}
    </section>
  );
}
