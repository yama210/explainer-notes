import { expect, test, type Page } from "@playwright/test";

function formatDate(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function fillRequiredNoteFields(page: Page, title: string) {
  await page.locator("#title").fill(title);
  await page
    .locator("#summary")
    .fill("E2E で作成した学習ノートです。内容の要点を短くまとめています。");
  await page
    .locator("#explanation")
    .fill("JWT の基本構造を自分の言葉で説明できるかを確認するためのノートです。");
  await page.locator("#body").fill("## E2E body\n\n- preview check");
  await page.locator("#tags").fill("e2e, auth");
}

async function deleteFromDetail(page: Page) {
  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole("button", { name: "削除する" }).click();
}

test.describe("major note flows", () => {
  test("can create a note with a review date", async ({ page }) => {
    const uniqueTitle = `Review note ${Date.now()}`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const reviewDate = formatDate(tomorrow);

    await page.goto("/notes/new");
    await fillRequiredNoteFields(page, uniqueTitle);
    await page.locator("#reviewDueAt").fill(reviewDate);
    await page.getByRole("button", { name: "ノートを作成する" }).click();

    await expect(page.getByRole("heading", { name: uniqueTitle })).toBeVisible();
    await expect(page.getByRole("link", { name: "#e2e" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "#auth" }).first()).toBeVisible();

    await page.getByRole("link", { name: "編集する" }).click();
    await expect(page.locator("#reviewDueAt")).toHaveValue(reviewDate);
    await page.goto(page.url().replace(/\/edit$/, ""));

    await page.getByRole("button", { name: "復習を完了する" }).click();
    await expect(
      page.getByText(/復習を完了しました。今回は/),
    ).toBeVisible();
    await expect(page.getByText("説明できる").first()).toBeVisible();

    await deleteFromDetail(page);
    await expect(page).toHaveURL(/\/notes$/);
  });

  test("can autosave, preserve filters and delete a note", async ({
    page,
  }) => {
    const uniqueTitle = `E2E note ${Date.now()}`;

    await page.goto("/notes/new");
    await fillRequiredNoteFields(page, uniqueTitle);
    await page.locator("#needsReview").uncheck();
    await page.getByRole("button", { name: "ノートを作成する" }).click();

    await expect(page.getByRole("heading", { name: uniqueTitle })).toBeVisible();

    await page.getByRole("link", { name: "編集する" }).click();
    await page.locator("#summary").fill("E2E で更新した学習ノートです。");
    await expect(page.getByTestId("autosave-state")).toHaveText("自動保存済み");
    await page.getByRole("button", { name: "保存して詳細へ戻る" }).click();

    await expect(page.getByRole("heading", { name: uniqueTitle })).toBeVisible();
    await expect(page).toHaveURL(/\/notes\/[^/]+$/);

    const detailPath = new URL(page.url()).pathname;
    await page.getByRole("link", { name: "タグ重視" }).click();
    await expect(page).toHaveURL(/related=tag_focused/);
    await page.goto(detailPath);
    await expect(page).toHaveURL(/related=tag_focused/);

    await page.goto("/notes");
    await page.locator("#q").fill("Prisma");
    await page.locator("#status").selectOption("DRAFT");
    await page.locator("#review").selectOption("overdue");
    await page.getByRole("button", { name: "検索する" }).click();
    await expect(page).toHaveURL(/q=Prisma/);
    await expect(page).toHaveURL(/status=DRAFT/);
    await expect(page).toHaveURL(/review=overdue/);
    await page.reload();
    await expect(page.locator("#q")).toHaveValue("Prisma");
    await expect(page.locator("#status")).toHaveValue("DRAFT");
    await expect(page.locator("#review")).toHaveValue("overdue");

    await page.goto("/notes");
    await page.locator("#q").fill(uniqueTitle);
    await page.getByRole("button", { name: "検索する" }).click();
    await page.getByRole("link", { name: uniqueTitle }).click();
    await deleteFromDetail(page);

    await expect(page).toHaveURL(/\/notes$/);
    await expect(page.getByText(uniqueTitle)).not.toBeVisible();
  });
});
