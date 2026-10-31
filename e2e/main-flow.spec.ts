import { readFile } from "node:fs/promises";
import { expect, test, type Page, type Request } from "@playwright/test";
import { ANALYZE, FILE_CONTENT, FILE_PATH, FOLLOW_UP, HINT, NEXT, PART, REPORT, START } from "./fixtures";

type Calls = Record<string, unknown[]>;

/** Answers every API route and GitHub raw fetch from fixtures, and records request bodies. */
async function mockBackend(page: Page): Promise<Calls> {
  const calls: Calls = {};
  const turns = [FOLLOW_UP, NEXT];
  const record = (name: string, request: Request) => (calls[name] ??= []).push(request.postDataJSON());

  await page.route("**/api/analyze", (route) => {
    record("analyze", route.request());
    return route.fulfill({ json: ANALYZE });
  });
  await page.route("**/api/interview/start", (route) => {
    record("start", route.request());
    return route.fulfill({ json: START });
  });
  await page.route("**/api/interview/turn", (route) => {
    record("turn", route.request());
    return route.fulfill({ json: turns.shift() ?? NEXT });
  });
  await page.route("**/api/interview/hint", (route) => {
    record("hint", route.request());
    return route.fulfill({ json: HINT });
  });
  await page.route("**/api/report", (route) => {
    record("report", route.request());
    return route.fulfill({ json: REPORT });
  });
  await page.route("https://raw.githubusercontent.com/**", (route) =>
    route.fulfill({ body: FILE_CONTENT, contentType: "text/plain; charset=utf-8" }),
  );
  return calls;
}

test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([
    { name: "pd-locale", value: "zh", url: baseURL! },
    { name: "pd-theme", value: "light", url: baseURL! },
  ]);
});

test("a student goes from a repo link to a report", async ({ page }) => {
  const calls = await mockBackend(page);

  // Home: paste a repo link
  await page.goto("/");
  await page.getByLabel("公开仓库链接").fill("https://github.com/kid/syllabus-helper");
  await page.getByRole("button", { name: "读取仓库" }).click();

  // Setup: part, difficulty, count
  await expect(page).toHaveURL(/\/setup$/);
  await expect(page.getByRole("heading", { name: "Syllabus Helper" })).toBeVisible();
  await page.getByRole("radio", { name: new RegExp(PART.title) }).click();
  await page.getByRole("radiogroup", { name: "难度" }).getByRole("radio", { name: /刁钻/ }).click();
  await page.getByRole("radiogroup", { name: "主问题数量" }).getByRole("radio", { name: "5" }).click();
  await page.getByRole("button", { name: "开始答辩" }).click();

  // Interview: question 1 with its citation and the cited file in the code panel
  await expect(page).toHaveURL(/\/interview$/);
  await expect(page.getByRole("heading", { name: /第 1 个问题/ })).toBeVisible();
  await expect(page.getByRole("button", { name: new RegExp(`${FILE_PATH}.*第 1–6 行`) })).toBeVisible();
  const codePanel = page.getByRole("region", { name: "代码" });
  await expect(codePanel.getByText("export async function extractDeadlines")).toBeVisible();

  expect(calls.analyze).toEqual([{ url: "https://github.com/kid/syllabus-helper", locale: "zh" }]);
  expect(calls.start[0]).toMatchObject({ count: 5, difficulty: "tricky", locale: "zh", part: { title: PART.title, files: PART.files } });

  // Answer → follow-up
  const answer = page.getByLabel("你的回答");
  await answer.fill("先检查是不是 PDF，再交给 AI 找日期。");
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByText("追问 1/2").filter({ visible: true })).toBeVisible();
  await expect(page.getByText(/如果用户上传一张图片/).filter({ visible: true })).toBeVisible();

  // Answer the follow-up → next question
  await answer.fill("会停在第 2 行，因为类型不是 PDF 就抛错。");
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByRole("heading", { name: /第 2 个问题/ })).toBeVisible();
  const secondTurn = calls.turn[1] as { thread: { exchanges: { kind: string; answer?: string }[] } };
  expect(secondTurn.thread.exchanges.map((exchange) => exchange.kind)).toEqual(["main", "followup"]);
  expect(secondTurn.thread.exchanges[1].answer).toContain("第 2 行");

  // A hint on question 2
  await page.getByRole("button", { name: "给点提示" }).click();
  await expect(page.getByText(/的第 2 行。/).filter({ visible: true })).toBeVisible();
  expect(calls.hint).toHaveLength(1);

  // Skip the rest
  for (let question = 2; question <= 5; question++) {
    await page.getByRole("button", { name: "我不知道，跳过" }).click();
  }
  await expect(page.getByRole("heading", { name: "答辩完成" })).toBeVisible();

  // Report
  await page.getByRole("button", { name: "生成报告" }).click();
  await expect(page).toHaveURL(/\/report$/);
  await expect(page.getByRole("heading", { name: "理解反馈报告", level: 1 })).toBeVisible();
  await expect(page.getByText(REPORT.summary)).toBeVisible();
  const reportRequest = calls.report[0] as { plan: unknown[]; threads: { hints: string[] }[] };
  expect(reportRequest.plan).toHaveLength(5);
  expect(reportRequest.threads[1].hints).toEqual([HINT.hint]);

  const layerList = page.getByRole("list").filter({ hasText: "解释功能" }).filter({ hasText: "/ 5" });
  await expect(layerList.getByRole("listitem")).toHaveCount(5);
  await expect(layerList.getByRole("listitem").filter({ hasText: "解释功能" })).toContainText("5 / 5");
  await expect(page.getByRole("button", { name: /第 1 个问题.*讲清楚/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /第 2 个问题.*未作答/ })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 Markdown" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^defense-report-syllabus-helper-\d{4}-\d{2}-\d{2}\.md$/);
  const markdown = await readFile((await download.path())!, "utf8");
  expect(markdown).toContain("# 理解反馈报告");
  expect(markdown).toContain(REPORT.summary);
});

test("switching to English sticks across a reload", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("用你自己的代码，练一场答辩。");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Defend the code you built.");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Defend the code you built.");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
