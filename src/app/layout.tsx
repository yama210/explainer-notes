import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: {
    default: "Explainer Notes",
    template: "%s | Explainer Notes",
  },
  description:
    "理解した内容を、自分の言葉で整理して説明できる状態に育てていく学習ノートアプリです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <div className="sticky top-0 z-50 w-full border-b border-[var(--line-light)] bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <span className="font-heading text-base font-semibold text-[var(--foreground)]">
                Explainer Notes
              </span>
            </Link>

            <nav className="flex flex-wrap items-center gap-1 text-sm">
              <Link
                href="/"
                className="rounded-md px-3 py-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              >
                ホーム
              </Link>
              <Link
                href="/notes"
                className="rounded-md px-3 py-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              >
                ノート一覧
              </Link>
              <Link href="/notes/new" className="action-primary ml-2 px-4 py-1.5">
                新規作成
              </Link>
            </nav>
          </div>
        </div>

        <div className="page-shell px-5 pb-20 pt-8 sm:px-8 lg:px-10">
          {children}
        </div>
      </body>
    </html>
  );
}
