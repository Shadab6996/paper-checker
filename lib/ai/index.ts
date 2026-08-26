import type { AiProvider, GradeParams, GradeResult } from "./types";
import { gradeWithGemini } from "./gemini";
import { gradeWithOpenRouter } from "./openrouter";

export * from "./types";

export async function gradeWithProvider(
  provider: AiProvider,
  params: GradeParams
): Promise<GradeResult> {
  switch (provider) {
    case "gemini":
      return gradeWithGemini(params);
    case "openrouter":
      return gradeWithOpenRouter(params);
  }
}
