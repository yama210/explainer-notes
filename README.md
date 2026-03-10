# Explainer Notes

Explainer Notes は、「読んだ」で終わらせず、
「自分の言葉で説明できる」状態まで理解を整理するための学習ノートアプリです。

汎用メモ帳ではなく、要点、説明、つまずき、次のアクション、復習予定、Markdown 本文を
ひとつのノートとしてまとめ、学習の進み具合があとから見ても分かるように設計しています。

このリポジトリは就活用ポートフォリオとしても整備しており、
データ設計、CRUD、実 DB 連携、UI/UX、テスト、README、Docker、CI まで
一通り自走して作れることが伝わる構成にしています。

## ポートフォリオとして見せたい点

このアプリでは次の点を示すことを目的にしています。

- Next.js App Router を使ったフルスタック CRUD 実装
- Prisma 7 + PostgreSQL を使った実 DB 連携
- Zod による型安全なバリデーション
- Server Components を基本にした責務分離
- 学習体験に寄せた UI / UX 設計
- Docker を使ったローカル開発環境
- GitHub Actions による自動テスト

## コンセプト

基本方針はシンプルです。

- 学んだことを記録する
- 自分の言葉で言い換える
- まだ曖昧な点を残す
- 次に見直すことを決める

UI もこの考え方に合わせて、静かで読みやすい方向に寄せています。

- 白ベース
- 広めの余白
- アクセントカラーは最小限
- 情報を詰め込みすぎない
- 詳細は読むことを優先
- 編集は書くことを優先

## 主な機能

### ノート機能

- `/notes` ノート一覧
- `/notes/new` 新規作成
- `/notes/[id]` 詳細表示
- `/notes/[id]/edit` 編集
- 削除確認付きの削除機能

### 学習向けの構造化ノート

各ノートは次の項目を持ちます。

- `title`
- `summary`
- `explanation`
- `stuckPoints`
- `nextActions`
- `body` (Markdown)
- `tags`
- `status`
- `needsReview`
- `reviewDueAt`

### 検索・絞り込み・並び替え

- タイトル / 本文 / タグ対象のキーワード検索
- ステータス絞り込み
- タグ絞り込み
- 復習条件での絞り込み
- 更新日 / 作成日 / タイトル順のソート
- 条件を URL クエリに反映

### Markdown 対応

- 作成 / 編集画面で Markdown を入力
- エディタとプレビューの分割表示
- 詳細画面で読みやすくレンダリング

### 学習支援

- ダッシュボード統計
- 最近更新したノート表示
- ノート更新履歴
- 同タグベースの関連ノート
- 復習キューと復習予定日
- 編集中の自動保存

### 体験面の整備

- 空状態
- loading / error 状態
- not-found
- 入力エラー表示

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

## 画面一覧

- `/`
  - ランディング兼ダッシュボード入口
- `/notes`
  - 検索可能なノート一覧
- `/notes/new`
  - 学習ノートの新規作成
- `/notes/[id]`
  - 詳細、履歴、関連ノート表示
- `/notes/[id]/edit`
  - 自動保存付き編集画面

## データモデル

### `Note`

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
- `createdAt`
- `updatedAt`

### `NoteRevision`

保存時点の内容を残す軽量な履歴モデルです。

- `id`
- `noteId`
- `title`
- `summary`
- `explanation`
- `stuckPoints`
- `nextActions`
- `body`
- `tags`
- `status`
- `needsReview`
- `reviewDueAt`
- `createdAt`

### `NoteStatus`

- `DRAFT`
- `REVIEWING`
- `EXPLAINABLE`
- `ARCHIVED`

## Prisma 7 構成

このプロジェクトは Prisma 7 に揃えています。

- datasource URL は `prisma.config.ts` で管理
- `prisma/schema.prisma` の datasource には `provider` のみを記述
- 実行時接続は `@prisma/adapter-pg` + `pg` を使用
- seed も同じ adapter 構成で PostgreSQL に接続

## テストと CI

### ローカルで実行するテスト

- `pnpm lint`
- `pnpm test:unit`
- `pnpm build`
- `pnpm test:e2e`
- `pnpm check`

### 自動実行する CI

GitHub Actions ワークフロー:

- `.github/workflows/ci.yml`

push / pull request 時に以下を自動実行します。

1. lint
2. unit test
3. build
4. PostgreSQL を使った Playwright E2E

E2E 失敗時は Playwright レポートを artifact として保存します。

## セットアップ

### 前提

- Node.js 20 以上
- pnpm
- Docker / Docker Compose

### ローカル開発

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

7. ブラウザで開く

```text
http://localhost:3000
```

## Docker 開発

アプリコンテナは `scripts/docker-dev-entrypoint.sh` 経由で起動し、以下を順に実行します。

1. `pnpm install --frozen-lockfile`
2. `pnpm prisma generate`
3. `pnpm prisma migrate deploy`
4. `pnpm dev -H 0.0.0.0 -p 3000`

起動コマンド:

```bash
pnpm docker:dev
```

コンテナ内で seed を再投入する場合:

```bash
docker compose exec app pnpm db:seed
```

volume が崩れた場合:

```bash
docker compose down -v
pnpm docker:dev
```

## Prisma migration / seed

### Migration

- `prisma/migrations/20260215132407_init/migration.sql`
- `prisma/migrations/20260308110000_portfolio_upgrade/migration.sql`

### Seed

`prisma/seed.ts` では次のサンプルノートを投入します。

- JWT
- 動的計画法
- Prisma

各ノート作成時に、初期の `NoteRevision` も同時に作成します。

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
├─ docker-compose.yaml
├─ Dockerfile.dev
├─ package.json
├─ playwright.config.ts
├─ pnpm-workspace.yaml
├─ prisma.config.ts
└─ README.md
```

## 設計判断

- Server Components を基本にし、フォーム、自動保存、削除確認など対話が必要な部分だけ Client Components に分離
- Prisma アクセスは `src/lib/prisma.ts`、repository、service 層に寄せて UI から分離
- タグは PostgreSQL の `String[]` を使い、絞り込みや関連ノートを過剰設計せず実装
- 履歴は `NoteRevision` にスナップショット保存し、差分管理までは持ち込まない
- 認証はあえて入れていない
  - 今回は単一ユーザー前提で、学習ノート体験、CRUD 品質、設計の分かりやすさを優先
  - 将来的にユーザー所有権を足せるような構成は意識

## よく使うコマンド

```bash
pnpm dev
pnpm lint
pnpm test
pnpm test:unit
pnpm test:e2e
pnpm build
pnpm check
pnpm docker:dev
pnpm db:generate
pnpm db:migrate
pnpm db:deploy
pnpm db:seed
```

## 今後の改善余地

- 認証とユーザー単位のノート分離
- ノート間リンク
- Markdown エディタの強化
- CI からデプロイまでのパイプライン
- 復習通知や spaced repetition 的な導線
- README への画面キャプチャ追加
