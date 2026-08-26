export type GradeQuestion = {
  question: string;
  marksAwarded: number;
  marksPossible: number;
  feedback: string;
};

export type GradeResult = {
  totalScore: number;
  totalMaxScore: number;
  questions: GradeQuestion[];
  overallFeedback: string;
};

type BlobFile = { data: Buffer; contentType: string };

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

function buildPrompt(subject: string, chapterName: string): string {
  return `You are grading a student's handwritten answer sheet for a school test.

Subject: ${subject}
Chapter: ${chapterName}

You are given the official answer key / marking scheme, and a photo of the student's
handwritten answer sheet. Read the student's handwriting carefully. For each question in
the answer key, decide how many marks the student's answer earns out of the marks that
question is worth, based strictly on the marking scheme. Be fair but accurate — do not
give credit for blank, illegible, or incorrect answers.

Return JSON with:
- totalScore: sum of marks awarded across all questions
- totalMaxScore: sum of marks possible across all questions (from the answer key)
- questions: one entry per question, each with:
  - question: the question number/label (e.g. "Q1")
  - marksAwarded: marks given to the student for this question
  - marksPossible: marks this question is worth
  - feedback: one or two short, plain-language sentences explaining what was right or
    wrong, and if marks were cut, exactly what was missing or incorrect
- overallFeedback: 2-4 sentences, written directly to the student, summarizing what they
  did well and what they most need to improve next time

If a question's handwriting is unreadable, award 0 marks and say so in that question's
feedback rather than guessing.`;
}

export async function gradeSubmission(params: {
  subject: string;
  chapterName: string;
  submission: BlobFile;
  answerKey: BlobFile;
  questionPaper?: BlobFile | null;
}): Promise<GradeResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";

  const parts: Record<string, unknown>[] = [
    { text: buildPrompt(params.subject, params.chapterName) },
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

  parts.push({ text: "Student's submitted answer sheet (grade this):" });
  parts.push({
    inlineData: {
      mimeType: params.submission.contentType,
      data: params.submission.data.toString("base64"),
    },
  });

  const res = await fetch(
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

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini request failed (${res.status}): ${errText.slice(0, 300)}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no content");

  return JSON.parse(text) as GradeResult;
}
