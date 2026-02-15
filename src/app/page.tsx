export default function NotesPage() {
  const notes = [
    { id: "1", title: "JWTとは？", status: "draft", tags: "auth,web" },
    { id: "2", title: "DPの考え方", status: "in_progress", tags: "algo" },
  ];

  return (
    <main className="p-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Notes</h1>
        <p className="text-sm text-gray-600">理解を“説明できる”形にするノート</p>
      </header>

      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="タイトルで検索（仮）"
        />
        <button className="border rounded px-3 py-2 whitespace-nowrap">
          新規作成（仮）
        </button>
      </div>

      <ul className="space-y-2">
        {notes.map((n) => (
          <li key={n.id} className="border rounded p-3">
            <div className="font-medium">{n.title}</div>
            <div className="text-sm text-gray-600">
              status: {n.status} / tags: {n.tags}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}