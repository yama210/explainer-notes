import { PrismaPg } from "@prisma/adapter-pg";
import { NoteStatus, PrismaClient } from "@prisma/client";

const connectionString = process.env["DATABASE_URL"];

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
  }),
  log: ["error"],
});

const seedNotes = [
  {
    title: "JWT を自分の言葉で説明できる形に整理する",
    summary:
      "JWT は署名付きトークンであり、セッション管理とは違う設計意図があることを理解した。",
    explanation:
      "JWT は header、payload、signature の3つで構成される。payload は読めても信頼してよいとは限らず、サーバー側は signature を検証して改ざんがないかを確認する。",
    stuckPoints:
      "Cookie セッションとの使い分けをまだ説明し切れない。失効戦略をどう考えるかも曖昧。",
    nextActions:
      "Refresh Token を含めた認証フローを図にして、Cookie ベースとの比較もメモする。",
    body: `## 要点

- JWT は Base64URL で読めるが、それ自体で安全という意味ではない
- サーバーは signature を検証して改ざんを検知する
- 失効戦略まで含めて理解すると説明しやすい

## 例
\`\`\`ts
const token = sign({ sub: user.id, role: "member" }, secret, {
  expiresIn: "15m",
});
\`\`\`
`,
    tags: ["auth", "web", "security"],
    status: NoteStatus.EXPLAINABLE,
    needsReview: false,
    reviewDueAt: null,
    reviewCount: 2,
    lastReviewedAt: new Date("2026-03-08T09:00:00+09:00"),
  },
  {
    title: "動的計画法を説明できるようにする",
    summary:
      "DP は大きい問題を小さい部分問題に分け、結果を使い回す考え方だと整理できた。",
    explanation:
      "毎回同じ計算を繰り返すと無駄が多い。部分問題の答えを表に保存し、次の計算に再利用することで全体を効率化する。",
    stuckPoints:
      "状態の定義をどこまで細かく切るべきかで迷いやすい。遷移式を言語化するときもまだ不安がある。",
    nextActions:
      "ナップサックと LIS を題材にして、状態・遷移・初期値を自分の言葉で説明する。",
    body: `## 考え方

1. 状態を定義する
2. 遷移を定義する
3. 初期値と更新順を決める

### 代表例
- ナップサック問題
- 最長共通部分列
- LIS
`,
    tags: ["algorithm", "dp", "interview"],
    status: NoteStatus.REVIEWING,
    needsReview: true,
    reviewDueAt: new Date("2026-03-12T09:00:00+09:00"),
    reviewCount: 1,
    lastReviewedAt: new Date("2026-03-09T09:00:00+09:00"),
  },
  {
    title: "Prisma で N+1 を避ける設計メモ",
    summary:
      "Prisma では select と include の使い分けを明確にしないと、画面ごとに不要な取得が増える。",
    explanation:
      "一覧用と詳細用で必要なフィールドは異なるので、用途ごとに select を切り分ける方が読みやすく、N+1 の温床にもなりにくい。",
    stuckPoints:
      "repository にどこまで責務を寄せるかの判断がまだ曖昧。include の使い過ぎも気になる。",
    nextActions:
      "SQL ログを見ながら、一覧 API と詳細 API の取得項目を比較する。",
    body: `## メモ

- 一覧では \`select\` を使って必要な列だけ取る
- 詳細では関連データの取得を含めて設計する
- Server Components と組み合わせると、取得責務を整理しやすい
`,
    tags: ["backend", "prisma", "database"],
    status: NoteStatus.DRAFT,
    needsReview: true,
    reviewDueAt: new Date("2026-03-10T19:00:00+09:00"),
    reviewCount: 0,
    lastReviewedAt: null,
  },
];

async function main() {
  await prisma.noteRevision.deleteMany();
  await prisma.note.deleteMany();

  for (const note of seedNotes) {
    const created = await prisma.note.create({
      data: note,
    });

    await prisma.noteRevision.create({
      data: {
        noteId: created.id,
        title: created.title,
        summary: created.summary,
        explanation: created.explanation,
        stuckPoints: created.stuckPoints,
        nextActions: created.nextActions,
        body: created.body,
        tags: created.tags,
        status: created.status,
        needsReview: created.needsReview,
        reviewDueAt: created.reviewDueAt,
        reviewCount: created.reviewCount,
        lastReviewedAt: created.lastReviewedAt,
      },
    });
  }
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
