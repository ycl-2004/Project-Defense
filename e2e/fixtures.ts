import type { PlannedQuestion, RepoRef, Report } from "../src/lib/domain";
import type { TurnDecision } from "../src/lib/interview/machine";
import type { AnalyzeResult, StartResult } from "../src/lib/server/services";

/** Canned API responses, typed by the app's own contracts so they can't drift from the real shapes. */

export const REPO: RepoRef = { owner: "kid", repo: "syllabus-helper", ref: "main", sha: "0123456789abcdef0123456789abcdef01234567", subdir: "" };

export const FILE_PATH = "src/lib/extract.ts";
export const FILE_CONTENT = Array.from({ length: 40 }, (_, index) => {
  if (index === 0) return "export async function extractDeadlines(file: File) {";
  if (index === 1) return '  if (file.type !== "application/pdf") throw new Error("PDF only");';
  return `  const step${index + 1} = ${index + 1};`;
}).join("\n");

const lines = FILE_CONTENT.split("\n");
const snippet = (startLine: number, endLine: number) => ({
  path: FILE_PATH,
  startLine,
  endLine,
  code: lines.slice(startLine - 1, endLine).join("\n"),
});

export const PART = {
  id: "p1",
  title: "截止日期提取",
  summary: "读取上传的 PDF 并找出所有截止日期。",
  files: [FILE_PATH, "src/app/api/upload/route.ts"],
};

export const ANALYZE: AnalyzeResult = {
  repo: REPO,
  overview: { name: "Syllabus Helper", oneLiner: "上传课程大纲，自动提取截止日期。", stack: ["Next.js", "DeepSeek"], summary: "一个帮学生整理截止日期的小工具。" },
  parts: [PART, { id: "p2", title: "日历同步", summary: "把日期写进日历。", files: ["src/lib/calendar.ts"] }],
  fileCount: 12,
};

const LAYERS = ["explain", "code", "decision", "failure", "apply"] as const;

export const PLAN: PlannedQuestion[] = LAYERS.map((layer, index) => ({
  id: `q${index + 1}`,
  layer,
  difficulty: "tricky",
  question: `第 ${index + 1} 个问题：\`extractDeadlines\` 在这一步做了什么？`,
  focus: `检查第 ${index + 1} 层的理解。`,
  snippet: snippet(1 + index * 4, 6 + index * 4),
}));

export const START: StartResult = { part: { ...PART, id: "selected" }, plan: PLAN };

export const FOLLOW_UP: TurnDecision = {
  type: "followup",
  prompt: "你说“先检查类型”。如果用户上传一张图片，会停在哪一行？",
  difficulty: "tricky",
  snippet: snippet(2, 2),
};

export const NEXT: TurnDecision = { type: "next" };

export const HINT = { hint: "看看 `extractDeadlines` 的第 2 行。" };

export const REPORT: Report = {
  summary: "能讲清楚上传到解析的主流程，对异常处理还不熟。",
  questions: PLAN.map((question, index) => ({
    id: question.id,
    rating: index === 0 ? "clear" : "unanswered",
    evidence: index === 0 ? "你说先检查 PDF 类型，对应第 2 行。" : "跳过了这道题。",
    comment: index === 0 ? "主流程讲得很清楚。" : "下次试着先说说你的猜测。",
  })),
  strengths: ["能指出类型检查所在的行"],
  misconceptions: [],
  studyNext: [{ topic: "错误处理", why: "后面几题都跳过了。", files: [FILE_PATH] }],
  mentorNextStep: { task: "给图片上传加一个友好的提示", why: "能验证对类型检查的理解。" },
};
