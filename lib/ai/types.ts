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

export type BlobFile = { data: Buffer; contentType: string };

export type GradeParams = {
  subject: string;
  chapterName: string;
  submission: BlobFile[];
  answerKey: BlobFile;
  questionPaper?: BlobFile | null;
  model?: string | null;
};

export const AI_PROVIDERS = ["gemini", "openrouter"] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];

export const PROVIDER_LABELS: Record<AiProvider, string> = {
  gemini: "Google Gemini",
  openrouter: "OpenRouter",
};

export const DEFAULT_MODELS: Record<AiProvider, string> = {
  gemini: "gemini-3.6-flash",
  openrouter: "dots-studio/dots-3-note-preview:free",
};

export type ModelOption = {
  id: string;
  provider: AiProvider;
  model: string;
  label: string;
};

// Only models that are genuinely free and verified to actually grade an image + return
// valid JSON — kept short on purpose so admin can just pick one, not guess.
export const FREE_MODEL_OPTIONS: ModelOption[] = [
  {
    id: "gemini-flash",
    provider: "gemini",
    model: "gemini-3.6-flash",
    label: "Google Gemini — gemini-3.6-flash (recommended, most reliable)",
  },
  {
    id: "openrouter-dots",
    provider: "openrouter",
    model: "dots-studio/dots-3-note-preview:free",
    label: "OpenRouter — Dots 3 Note (free, backup option)",
  },
];

export function buildGradingPrompt(subject: string, chapterName: string): string {
  return `You are grading a student's handwritten answer sheet for a school test.

Subject: ${subject}
Chapter: ${chapterName}

You are given the official answer key / marking scheme, and one or more photos of the
student's handwritten answer sheet (it may span multiple pages/photos — treat them as one
continuous answer sheet). Read the student's handwriting carefully. For each question in
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
