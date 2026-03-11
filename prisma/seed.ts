import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, NoteStatus } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.note.deleteMany();

  await prisma.note.createMany({
    data: [
      {
        title: "JWT を自分の言葉で説明する",
        summary:
          "JWT は署名付きトークンで、サーバーが改ざんを検知しながら認証情報を受け渡せる。",
        explanation:
          "JWT は header.payload.signature の3つで構成される。payload にユーザー情報や権限を入れ、signature で改ざんされていないことを確認する。サーバーは secret または公開鍵で署名を検証する。",
        stuckPoints:
          "Cookie で送る場合と Authorization ヘッダーで送る場合の使い分けをまだ整理しきれていない。",
        nextActions:
          "Refresh Token の役割と、JWT の有効期限が切れた後の流れを別ノートにまとめる。",
        body: `## 要点

- JWT は署名によって改ざんを検知できる
- セッションをサーバーに保持しない構成と相性がよい

\`\`\`ts
const token = sign(payload, secret, { expiresIn: "1h" });
\`\`\``,
        tags: ["auth", "jwt", "security"],
        status: NoteStatus.REVIEWING,
        needsReview: true,
        reviewDueAt: new Date("2026-03-12T00:00:00.000Z"),
        reviewCount: 1,
        lastReviewedAt: new Date("2026-03-10T00:00:00.000Z"),
      },
      {
        title: "動的計画法の考え方を整理する",
        summary:
          "大きな問題を小さな部分問題に分けて、同じ計算を繰り返さないようにする手法。",
        explanation:
          "再帰だけだと同じ部分問題を何度も解いてしまう。動的計画法では、一度求めた答えを配列や表に保存しながら順番に解くことで計算量を減らす。",
        stuckPoints:
          "メモ化再帰と配列 DP をどう使い分けるかがまだ曖昧。状態設計の切り分けも練習が必要。",
        nextActions:
          "ナップサック問題と LIS を題材に、状態・遷移・初期値を言語化して比較する。",
        body: `## 考え方

1. 状態を定義する
2. 遷移を決める
3. 初期値を決める

- フィボナッチ数列
- ナップサック問題`,
        tags: ["algorithm", "dp"],
        status: NoteStatus.DRAFT,
        needsReview: true,
        reviewDueAt: new Date("2026-03-13T00:00:00.000Z"),
        reviewCount: 0,
        lastReviewedAt: null,
      },
      {
        title: "Prisma の migrate と generate の違い",
        summary:
          "generate はクライアント生成、migrate はスキーマ変更を DB に反映するための仕組み。",
        explanation:
          "schema.prisma を書き換えたあと、TypeScript から型安全に使うためには generate が必要。DB テーブル構造を変更するには migrate dev や migrate deploy を使う。",
        stuckPoints:
          "Prisma 7 の prisma.config.ts と adapter の役割をもう少し説明できるようにしたい。",
        nextActions:
          "prisma.config.ts と schema.prisma の責務の違いを README 用に図解する。",
        body: `## コマンド

\`\`\`bash
pnpm db:generate
pnpm db:migrate
\`\`\`

> generate はクライアント生成、migrate は DB 変更`,
        tags: ["prisma", "database", "nextjs"],
        status: NoteStatus.EXPLAINABLE,
        needsReview: false,
        reviewDueAt: null,
        reviewCount: 2,
        lastReviewedAt: new Date("2026-03-09T00:00:00.000Z"),
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
