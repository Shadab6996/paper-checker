import { buildGradingPrompt, DEFAULT_MODELS, type GradeParams, type GradeResult, type BlobFile } from "./types";

const SCHEMA_INSTRUCTIONS = `Respond with ONLY a JSON object (no markdown, no code fences) matching exactly this shape:
{
  "totalScore": number,
  "totalMaxScore": number,
  "questions": [{ "question": string, "marksAwarded": number, "marksPossible": number, "feedback": string }],
  "overallFeedback": string
}`;

function toImageContent(file: BlobFile): Record<string, unknown> {
  if (file.contentType === "application/pdf") {
    throw new Error(
      "Grok grading only supports image files (JPEG/PNG) for the answer key and question paper — re-upload as an image, or switch to Gemini/Claude for this test."
    );
  }
  return {
    type: "image_url",
    image_url: { url: `data:${file.contentType};base64,${file.data.toString("base64")}` },
  };
}

export async function gradeWithGrok(params: GradeParams): Promise<GradeResult> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("XAI_API_KEY is not set");
  const model = params.model || DEFAULT_MODELS.grok;

  const content: Record<string, unknown>[] = [
    {
      type: "text",
      text: `${buildGradingPrompt(params.subject, params.chapterName)}\n\n${SCHEMA_INSTRUCTIONS}`,
    },
    { type: "text", text: "Answer key / marking scheme:" },
    toImageContent(params.answerKey),
  ];

  if (params.questionPaper) {
    content.push({ type: "text", text: "Question paper (for reference):" });
    content.push(toImageContent(params.questionPaper));
  }

  content.push({
    type: "text",
    text:
      params.submission.length > 1
        ? "Student's submitted answer sheet, in order (grade this — treat all pages as one answer sheet):"
        : "Student's submitted answer sheet (grade this):",
  });
  for (const [i, file] of params.submission.entries()) {
    if (params.submission.length > 1) content.push({ type: "text", text: `Page ${i + 1}:` });
    content.push(toImageContent(file));
  }

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Grok request failed (${res.status}): ${errText.slice(0, 300)}`);
  }

  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Grok returned no content");

  return JSON.parse(text) as GradeResult;
}
