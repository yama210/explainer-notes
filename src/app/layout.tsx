import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Explainer Notes",
    template: "%s | Explainer Notes",
  },
  description:
    "理解した内容を、自分の言葉で説明できる形に整理するための学習ノートアプリ。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <div className="page-shell px-5 pb-16 pt-6 sm:px-8 lg:px-10">
          <header className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <Link href="/" className="space-y-1">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                Explainer Notes
              </div>
              <div className="text-lg font-semibold tracking-[-0.02em]">
                理解を整理するための静かな学習ノート
              </div>
            </Link>

            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <Link href="/" className="action-secondary px-4 py-2.5">
                ホーム
              </Link>
              <Link href="/notes" className="action-secondary px-4 py-2.5">
                ノート一覧
              </Link>
              <Link href="/notes/new" className="action-primary px-4 py-2.5">
                新規作成
              </Link>
            </nav>
          </header>

          {children}
        </div>
      </body>
    </html>
  );
}
