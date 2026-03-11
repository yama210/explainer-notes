# Explainer Notes

学んだ内容を、自分の言葉で説明できる状態まで整理するための学習ノートアプリです。  
単なるメモ帳ではなく、要点、説明、つまずき、次にやること、復習予定を一つの流れで扱えるように設計しています。

## ポートフォリオ概要

- 種別: 就職活動用ポートフォリオ / フルスタック Web アプリ
- テーマ: 学習内容を整理し、説明できる状態まで育てるノートアプリ
- 主な見どころ: CRUD、DB 設計、検索、復習導線、UI/UX、テスト、Docker、CI

## デモ

- GitHub: このリポジトリ
- 公開 URL: デプロイ後にここへ追記
- 動作確認用アカウント: 認証未実装のため不要

公開デモを用意する場合は、README 冒頭に URL を置くのが一番見てもらいやすいです。

## スクリーンショット / 動画

ポートフォリオとして提出するなら、最低でも次の 4 点は追加した方が伝わりやすいです。

- トップページ
- ノート一覧ページ
- ノート詳細ページ
- 作成 / 編集ページ

余裕があれば、次のどちらかも追加すると完成度が上がります。

- 検索、復習完了、Markdown プレビューが分かる短い GIF
- 30 秒から 60 秒程度の操作動画

画像を追加する場合の例:

```md
![トップページ](./docs/images/home.png)
![ノート一覧](./docs/images/notes-list.png)
![ノート詳細](./docs/images/note-detail.png)
![ノート編集](./docs/images/note-edit.png)
```

動画を追加する場合の例:

```md
- デモ動画: https://www.youtube.com/watch?v=xxxxxxxxxxx
```

## このリポジトリで見てほしいこと

- Next.js App Router を使ったフルスタック実装
- Prisma + PostgreSQL を前提にしたデータ設計
- CRUD、検索、絞り込み、ソートの実装
- 学習アプリとしての UI / UX 設計
- Zod による型安全なバリデーション
- Docker、CI、Unit Test、E2E Test を含む開発体験

## アプリ概要

Explainer Notes は、理解途中の内容を下書きとして残し、復習と更新を重ねながら「説明できる状態」まで育てていくノートアプリです。

このアプリで解決したいことは、学んだ内容を単に記録するだけで終わらせず、あとから説明できる形に整理し直せるようにすることです。

ノートは次の流れで使う想定です。

1. 学んだ内容を要点と説明で記録する
2. つまずきや疑問を残す
3. 次に復習したい内容を整理する
4. 復習予定日を設定する
5. 復習完了や更新を重ねながら理解を深める

## 主な機能

### ノート管理

- `/notes` ノート一覧
- `/notes/new` 新規作成
- `/notes/[id]` 詳細表示
- `/notes/[id]/edit` 編集
- 削除前の確認 UI

### 学習ノート向けの構造化

- `title`
- `summary`
- `explanation`
- `stuckPoints`
- `nextActions`
- `body`（Markdown）
- `tags`
- `status`
- `needsReview`
- `reviewDueAt`

### 検索 / 絞り込み / ソート

- キーワード検索
- ステータス絞り込み
- タグ絞り込み
- 復習状態での絞り込み
- 更新日 / 作成日 / タイトル順のソート
- URL クエリへの反映

### 学習体験を支える機能

- Markdown 入力と分割プレビュー
- 自動保存
- 関連ノート表示
- 復習完了と次回復習日の自動設定
- ダッシュボード表示

### 状態ごとの UI

- ノート 0 件時の空状態
- 検索結果 0 件時の表示
- `loading.tsx` / `error.tsx` / `not-found.tsx` の整備

## 画面一覧

- `/`
  - アプリ概要、今日やること、最近更新したノート、復習導線を表示するトップページ
- `/notes`
  - ノート一覧、検索、絞り込み、ソート、学習状況を表示
- `/notes/new`
  - 学習ノートの新規作成ページ
- `/notes/[id]`
  - ノート詳細、関連ノート、復習導線を表示
- `/notes/[id]/edit`
  - 自動保存付きの編集ページ

## 採用担当向けの見どころ

### 1. 単純なメモ帳で終わらせていないこと

要点、説明、つまずき、次にやること、復習予定までを 1 つのノートに含め、学習アプリとして意味のある構造を持たせています。

### 2. CRUD だけでなく検索と状態管理まで作っていること

ノートの作成、編集、削除に加えて、検索、絞り込み、ソート、復習導線、関連ノートを備えています。

### 3. 設計と保守性を意識していること

Prisma を使った DB 設計、`src/lib` へのロジック集約、Zod によるバリデーション、Vitest / Playwright による検証まで含めて整えています。

## 使用技術

- Next.js 16
- React 19
- App Router
- TypeScript (`strict: true`)
- Tailwind CSS 4
- Prisma 7
- `@prisma/adapter-pg`
- PostgreSQL 16
- Zod
- react-markdown
- remark-gfm
- Vitest
- Testing Library
- Playwright
- Docker Compose
- GitHub Actions

## 技術選定の意図

### Next.js App Router

画面、API、データ取得を同一プロジェクトで整理しやすく、ポートフォリオとしてフロントエンドとバックエンドの接続を一貫して見せやすいため採用しました。

### Prisma + PostgreSQL

学習用アプリでも、実務に近い DB 設計と migration 運用を示したかったため採用しました。  
タグ配列、復習日、ステータス設計なども PostgreSQL 前提で整理しています。

### Zod

フォーム入力と API 入力のバリデーションを一元化し、型安全と責務分離を両立するため採用しました。

### Vitest / Playwright

ロジック単体とユーザー導線の両方を確認できるようにし、ポートフォリオとして「動くだけでなく保守できる」ことを示すため導入しています。

### Docker Compose

第三者がローカルで起動しやすいように、アプリと PostgreSQL をまとめて再現できる構成にしています。

## データモデル

### Note

学習ノート本体です。

- `id`
- `title`
- `summary`
- `explanation`
- `stuckPoints`
- `nextActions`
- `body`
- `tags: String[]`
- `status: NoteStatus`
- `needsReview`
- `reviewDueAt`
- `reviewCount`
- `lastReviewedAt`
- `createdAt`
- `updatedAt`

### NoteStatus

- `DRAFT`
  - まだ整理途中
- `REVIEWING`
  - 復習しながら理解を固めている状態
- `EXPLAINABLE`
  - 自分の言葉で説明できる状態
- `ARCHIVED`
  - いったん整理済みとして保管する状態

## ディレクトリ構成

```text
.
├─ .github/
│  └─ workflows/
│     └─ ci.yml
├─ prisma/
│  ├─ migrations/
│  ├─ schema.prisma
│  └─ seed.ts
├─ scripts/
│  └─ docker-dev-entrypoint.sh
├─ src/
│  ├─ app/
│  ├─ components/
│  ├─ lib/
│  └─ test/
├─ e2e/
│  └─ notes.spec.ts
├─ docker-compose.yaml
├─ Dockerfile.dev
├─ package.json
├─ playwright.config.ts
├─ prisma.config.ts
├─ vitest.config.ts
└─ README.md
```

## ローカルセットアップ

### 前提

- Node.js 20 以上
- pnpm
- Docker / Docker Compose

### 起動手順

1. 依存関係をインストール

```bash
pnpm install
```

2. PostgreSQL を起動

```bash
docker compose up -d db
```

3. Prisma Client を生成

```bash
pnpm db:generate
```

4. Migration を適用

```bash
pnpm db:deploy
```

5. Seed を投入

```bash
pnpm db:seed
```

6. 開発サーバーを起動

```bash
pnpm dev
```

7. ブラウザで確認

```text
http://localhost:3000
```

## 提出前に追加すると強いもの

- 公開 URL
- スクリーンショット 4 枚以上
- 30 秒から 60 秒程度の操作動画
- GitHub の About 欄への概要記載
- リポジトリを pinned repository に設定

## Docker での起動

アプリと PostgreSQL をまとめて起動できます。

```bash
pnpm docker:dev
```

アプリコンテナ起動時に次を実行します。

1. `pnpm install --frozen-lockfile`
2. `pnpm prisma generate`
3. `pnpm prisma migrate deploy`
4. `pnpm dev -H 0.0.0.0 -p 3000`

Seed を入れる場合:

```bash
docker compose exec app pnpm db:seed
```

volume を消してやり直す場合:

```bash
docker compose down -v
pnpm docker:dev
```

## Prisma migration / seed

### migration

- `prisma/migrations/20260215132407_init/migration.sql`
- `prisma/migrations/20260221065009_mvp_notes/migration.sql`
- `prisma/migrations/20260308110000_portfolio_upgrade/migration.sql`
- `prisma/migrations/20260311012000_learning_improvements/migration.sql`
- `prisma/migrations/20260311193000_remove_note_revision/migration.sql`

### seed

`prisma/seed.ts` では以下のサンプルノートを投入します。

- JWT
- 動的計画法
- Prisma

## テスト / CI

### ローカルで使う主なコマンド

```bash
pnpm lint
pnpm test:unit
pnpm test:e2e
pnpm build
pnpm check
```

### テスト構成

- `pnpm lint`
  - ESLint による静的解析
- `pnpm test:unit`
  - Vitest による unit test
- `pnpm test:e2e`
  - Playwright による E2E test
- `pnpm build`
  - 本番ビルド確認

### CI

GitHub Actions で次を自動実行します。

1. `pnpm db:generate`
2. `pnpm lint`
3. `pnpm test:unit`
4. `pnpm build`
5. PostgreSQL を使った `pnpm test:e2e:ci`

## 設計上の工夫

- Server Components を基本にし、フォームや削除確認など必要な箇所だけ Client Components を採用
- Prisma へのアクセスを `src/lib` に寄せて、UI とデータアクセスを分離
- バリデーションを Zod に集約
- タグは PostgreSQL の `String[]` で扱い、絞り込みと関連ノート表示をシンプルに実装
- 復習導線を `needsReview`、`reviewDueAt`、`reviewCount`、`lastReviewedAt` で表現し、学習ノートらしい状態管理を行う

## 既知の前提

- 認証は未実装です
- 単一ユーザー利用を前提にしています
- 今回は学習ノート体験と設計品質を優先しています

## 今後の改善余地

- 認証とユーザー分離
- ノート間リンク
- 復習アルゴリズムの強化
- Markdown エディタの補助 UI 改善
- スクリーンショット付き README
- 公開環境へのデプロイ

## ポートフォリオとして見てほしい点

- 学習アプリというテーマに合わせて、単純な CRUD を超えた機能設計にしていること
- データモデル、復習、関連ノートまで含めて一貫性を持たせていること
- 実装だけでなく、Docker、CI、テスト、README まで含めて第三者が扱える状態にしていること
