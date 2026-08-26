import type { AiProvider, GradeParams, GradeResult } from "./types";
import { gradeWithGemini } from "./gemini";
import { gradeWithAnthropic } from "./anthropic";
import { gradeWithGrok } from "./grok";
import { gradeWithOpenRouter } from "./openrouter";

export * from "./types";

export async function gradeWithProvider(
  provider: AiProvider,
  params: GradeParams
): Promise<GradeResult> {
  switch (provider) {
    case "gemini":
      return gradeWithGemini(params);
    case "anthropic":
      return gradeWithAnthropic(params);
    case "grok":
      return gradeWithGrok(params);
    case "openrouter":
      return gradeWithOpenRouter(params);
  }
}
