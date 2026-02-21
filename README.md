# 理解整理ノート (MVP)

学習内容を「説明できる形」で整理するためのノートアプリです。  
Next.js App Router / TypeScript / Tailwind / Prisma / PostgreSQL / Zod で実装しています。

## 機能

- ノートCRUD（作成 / 一覧 / 詳細 / 編集 / 削除）
- タグの複数付与・タグ絞り込み
- subject（programming / english / other）絞り込み
- タイトル・本文検索
- テンプレート選択式ノート（concept / error / phrase / procedure）

## セットアップ

1. 依存関係をインストール

```bash
pnpm install
```

2. `.env` を作成してDB接続文字列を設定

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/explainer_notes?schema=public"
```

3. Prisma Client生成

```bash
pnpm prisma:generate
```

4. マイグレーション

```bash
pnpm prisma:migrate --name mvp_notes
```

5. 開発サーバ起動

```bash
pnpm dev
```

## PostgreSQLをDockerで起動する場合

```bash
docker compose up -d db
```

`docker-compose.yaml` の `db` サービスを利用できます。
