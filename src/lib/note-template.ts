export const NOTE_TYPES = ["concept", "error", "phrase", "procedure"] as const;
export type NoteType = (typeof NOTE_TYPES)[number];

export const SUBJECTS = ["programming", "english", "other"] as const;
export type Subject = (typeof SUBJECTS)[number];

type TemplateField = {
  key: string;
  label: string;
  rows?: number;
  placeholder?: string;
};

export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  concept: "概念ノート",
  error: "エラーノート",
  phrase: "フレーズノート",
  procedure: "手順ノート",
};

export const SUBJECT_LABELS: Record<Subject, string> = {
  programming: "Programming",
  english: "English",
  other: "Other",
};

export const TEMPLATE_FIELDS: Record<NoteType, readonly TemplateField[]> = {
  concept: [
    { key: "summary", label: "一言でいうと", rows: 2 },
    { key: "purpose", label: "何のためにある？", rows: 3 },
    { key: "useCases", label: "どんな場面で使う？", rows: 3 },
    { key: "example", label: "例", rows: 3 },
    { key: "pitfalls", label: "注意点 / ハマりどころ", rows: 3 },
    { key: "relatedTerms", label: "関連用語", rows: 2 },
    { key: "ownWords", label: "自分の言葉で説明", rows: 4 },
  ],
  error: [
    { key: "errorMessage", label: "エラー文", rows: 2 },
    { key: "context", label: "発生状況", rows: 3 },
    { key: "cause", label: "原因", rows: 3 },
    { key: "solution", label: "解決方法", rows: 3 },
    { key: "prevention", label: "再発防止", rows: 3 },
    { key: "links", label: "関連リンク", rows: 2 },
  ],
  phrase: [
    { key: "japanese", label: "日本語", rows: 2 },
    { key: "englishExpressions", label: "英語表現（複数可）", rows: 3 },
    { key: "usage", label: "使う場面", rows: 3 },
    { key: "exampleSentence", label: "例文", rows: 3 },
    { key: "notes", label: "注意点（丁寧/カジュアルなど）", rows: 3 },
  ],
  procedure: [
    { key: "goal", label: "ゴール", rows: 2 },
    { key: "prerequisites", label: "前提条件", rows: 3 },
    { key: "steps", label: "手順", rows: 4 },
    { key: "pitfalls", label: "ハマりやすい点", rows: 3 },
    { key: "verification", label: "完了確認方法", rows: 2 },
  ],
};

export function isNoteType(value: string): value is NoteType {
  return NOTE_TYPES.includes(value as NoteType);
}

export function isSubject(value: string): value is Subject {
  return SUBJECTS.includes(value as Subject);
}
