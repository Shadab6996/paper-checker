import { buildGradingPrompt, DEFAULT_MODELS, type GradeParams, type GradeResult } from "./types";

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    totalScore: { type: "NUMBER" },
    totalMaxScore: { type: "NUMBER" },
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          marksAwarded: { type: "NUMBER" },
          marksPossible: { type: "NUMBER" },
          feedback: { type: "STRING" },
        },
        required: ["question", "marksAwarded", "marksPossible", "feedback"],
      },
    },
    overallFeedback: { type: "STRING" },
  },
  required: ["totalScore", "totalMaxScore", "questions", "overallFeedback"],
};

async function callGemini(
  model: string,
  apiKey: string,
  parts: Record<string, unknown>[]
): Promise<Response> {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    }
  );
}

export async function gradeWithGemini(params: GradeParams): Promise<GradeResult> {
  const primaryKey = process.env.GEMINI_API_KEY;
  if (!primaryKey) throw new Error("GEMINI_API_KEY is not set");
  const backupKey = process.env.GEMINI_API_KEY_2;
  const model = params.model || DEFAULT_MODELS.gemini;

  const parts: Record<string, unknown>[] = [
    { text: buildGradingPrompt(params.subject, params.chapterName) },
    { text: "Answer key / marking scheme:" },
    {
      inlineData: {
        mimeType: params.answerKey.contentType,
        data: params.answerKey.data.toString("base64"),
      },
    },
  ];

  if (params.questionPaper) {
    parts.push({ text: "Question paper (for reference):" });
    parts.push({
      inlineData: {
        mimeType: params.questionPaper.contentType,
        data: params.questionPaper.data.toString("base64"),
      },
    });
  }

  parts.push({
    text:
      params.submission.length > 1
        ? "Student's submitted answer sheet, in order (grade this — treat all pages as one answer sheet):"
        : "Student's submitted answer sheet (grade this):",
  });
  for (const [i, file] of params.submission.entries()) {
    if (params.submission.length > 1) parts.push({ text: `Page ${i + 1}:` });
    parts.push({
      inlineData: {
        mimeType: file.contentType,
        data: file.data.toString("base64"),
      },
    });
  }

  let res = await callGemini(model, primaryKey, parts);

  if (res.status === 429 && backupKey) {
    res = await callGemini(model, backupKey, parts);
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini request failed (${res.status}): ${errText.slice(0, 300)}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no content");

  return JSON.parse(text) as GradeResult;
}
