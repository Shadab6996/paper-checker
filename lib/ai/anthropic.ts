import { buildGradingPrompt, DEFAULT_MODELS, type GradeParams, type GradeResult, type BlobFile } from "./types";

const TOOL_SCHEMA = {
  type: "object",
  properties: {
    totalScore: { type: "number" },
    totalMaxScore: { type: "number" },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          marksAwarded: { type: "number" },
          marksPossible: { type: "number" },
          feedback: { type: "string" },
        },
        required: ["question", "marksAwarded", "marksPossible", "feedback"],
      },
    },
    overallFeedback: { type: "string" },
  },
  required: ["totalScore", "totalMaxScore", "questions", "overallFeedback"],
};

function toContentBlock(file: BlobFile): Record<string, unknown> {
  if (file.contentType === "application/pdf") {
    return {
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: file.data.toString("base64") },
    };
  }
  return {
    type: "image",
    source: { type: "base64", media_type: file.contentType, data: file.data.toString("base64") },
  };
}

export async function gradeWithAnthropic(params: GradeParams): Promise<GradeResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  const model = params.model || DEFAULT_MODELS.anthropic;

  const content: Record<string, unknown>[] = [
    { type: "text", text: buildGradingPrompt(params.subject, params.chapterName) },
    { type: "text", text: "Answer key / marking scheme:" },
    toContentBlock(params.answerKey),
  ];

  if (params.questionPaper) {
    content.push({ type: "text", text: "Question paper (for reference):" });
    content.push(toContentBlock(params.questionPaper));
  }

  content.push({
    text:
      params.submission.length > 1
        ? "Student's submitted answer sheet, in order (grade this — treat all pages as one answer sheet):"
        : "Student's submitted answer sheet (grade this):",
    type: "text",
  });
  for (const [i, file] of params.submission.entries()) {
    if (params.submission.length > 1) content.push({ type: "text", text: `Page ${i + 1}:` });
    content.push(toContentBlock(file));
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      tools: [
        {
          name: "submit_grade",
          description: "Submit the grading result for the student's answer sheet.",
          input_schema: TOOL_SCHEMA,
        },
      ],
      tool_choice: { type: "tool", name: "submit_grade" },
      messages: [{ role: "user", content }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Claude request failed (${res.status}): ${errText.slice(0, 300)}`);
  }

  const json = await res.json();
  const toolUse = (json?.content as { type: string; input?: unknown }[] | undefined)?.find(
    (block) => block.type === "tool_use"
  );
  if (!toolUse?.input) throw new Error("Claude returned no grading result");

  return toolUse.input as GradeResult;
}
