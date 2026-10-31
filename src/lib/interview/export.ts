import type { Difficulty, Part, PlannedQuestion, RepoRef, Report, Thread } from "@/lib/domain";
import { languageFromPath } from "@/lib/github/filter";
import { githubBlobUrl } from "@/lib/github/url";
import { format, type Messages } from "@/lib/i18n/messages";
import { layerScores } from "./scoring";

export type ReportDocument = {
  report: Report;
  plan: PlannedQuestion[];
  threads: Thread[];
  part: Pick<Part, "title">;
  repo: RepoRef;
  difficulty: Difficulty;
  createdAt: string;
};

/** A code fence longer than any backtick run inside the code, so the block can never end early. */
function fenced(code: string, lang: string): string {
  const longest = Math.max(2, ...[...code.matchAll(/`+/g)].map((match) => match[0].length));
  const fence = "`".repeat(longest + 1);
  return `${fence}${lang === "text" ? "" : lang}\n${code}\n${fence}`;
}

function quote(text: string): string {
  return text
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
}

/** The report as a self-contained Markdown file a mentor can read anywhere. */
export function reportMarkdown(doc: ReportDocument, t: Messages): string {
  const { report, plan, threads, repo } = doc;
  const ratingById = new Map(report.questions.map((question) => [question.id, question]));
  const threadById = new Map(threads.map((thread) => [thread.questionId, thread]));
  const hintCount = threads.reduce((sum, thread) => sum + thread.hints.length, 0);
  const lines: string[] = [];

  lines.push(`# ${t.report.title}`, "");
  lines.push(
    `${repo.owner}/${repo.repo}@${repo.sha.slice(0, 7)} · ${format(t.report.meta, {
      part: doc.part.title,
      difficulty: t.difficulty[doc.difficulty].name,
      count: plan.length,
    })} · ${format(t.report.generatedAt, { date: doc.createdAt.slice(0, 10) })}`,
    "",
  );

  lines.push(`## ${t.report.summary}`, "", report.summary, "");

  lines.push(`## ${t.report.layers}`, "", `| ${t.report.layerColumn} | ${t.report.scoreColumn} |`, "| --- | --- |");
  for (const score of layerScores(plan, report)) {
    lines.push(`| ${t.layer[score.layer].name} | ${score.score === null ? t.report.notAsked : `${score.score} / 5`} |`);
  }
  lines.push("", t.report.layersNote, "");

  lines.push(`## ${t.report.questions}`, "");
  plan.forEach((question, index) => {
    const rated = ratingById.get(question.id);
    const thread = threadById.get(question.id);
    const { snippet } = question;
    lines.push(
      `### ${index + 1}. ${t.layer[question.layer].name} · ${t.difficulty[question.difficulty].name}${rated ? ` · ${t.rating[rated.rating]}` : ""}`,
      "",
    );
    lines.push(`**${t.report.questionLabel}**${t.common.colon}${question.question}`, "");
    lines.push(`**${t.report.focus}**${t.common.colon}${question.focus}`, "");
    lines.push(
      `**${t.report.codeLabel}**${t.common.colon}[\`${snippet.path}\` ${format(t.common.lines, { start: snippet.startLine, end: snippet.endLine })}](${githubBlobUrl(repo, snippet.path, snippet.startLine, snippet.endLine)})`,
      "",
      fenced(snippet.code, languageFromPath(snippet.path)),
      "",
    );
    let followUps = 0;
    for (const exchange of thread?.exchanges ?? []) {
      if (exchange.kind === "followup") {
        followUps += 1;
        lines.push(`**${t.report.followUp} ${followUps}**${t.common.colon}${exchange.prompt}`, "");
      }
      lines.push(`**${t.report.yourAnswer}**${t.common.colon.trim()}`, "", quote(exchange.skipped || !exchange.answer ? t.report.answerSkipped : exchange.answer), "");
    }
    if (thread?.hints.length) lines.push(`_${format(t.report.hintsUsed, { count: thread.hints.length })}_`, "");
    if (rated) {
      lines.push(`**${t.report.evidence}**${t.common.colon}${rated.evidence}`, "", `**${t.report.feedback}**${t.common.colon}${rated.comment}`, "");
    }
  });

  lines.push(`## ${t.report.strengths}`, "", ...report.strengths.map((item) => `- ${item}`), "");
  lines.push(
    `## ${t.report.misconceptions}`,
    "",
    ...(report.misconceptions.length ? report.misconceptions.map((item) => `- ${item}`) : [t.report.noMisconceptions]),
    "",
  );
  lines.push(`## ${t.report.studyNext}`, "");
  for (const item of report.studyNext) {
    const files = item.files.length ? ` (${item.files.map((file) => `\`${file}\``).join(", ")})` : "";
    lines.push(`- **${item.topic}**${t.common.colon}${item.why}${files}`);
  }
  lines.push("", `## ${t.report.mentor}`, "", t.report.mentorLead, "", `**${report.mentorNextStep.task}**`, "", report.mentorNextStep.why, "");
  lines.push(format(t.report.hintsTotal, { count: hintCount }), "", "---", "", t.report.disclaimer, "");
  return lines.join("\n");
}
