import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";
import { fetchBlobBuffer } from "@/lib/blob";
import { gradeWithProvider, type AiProvider } from "@/lib/ai";

export const maxDuration = 60;

export const POST = withErrorHandling(async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { test: true },
  });
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  if (!submission.test.answerKeyPath) {
    return NextResponse.json(
      { error: "Upload an answer key for this test first" },
      { status: 400 }
    );
  }

  const [submissionFiles, answerKeyFile, questionPaperFile] = await Promise.all([
    Promise.all(submission.storagePaths.map((p) => fetchBlobBuffer(p))),
    fetchBlobBuffer(submission.test.answerKeyPath),
    submission.test.questionPaperPath
      ? fetchBlobBuffer(submission.test.questionPaperPath)
      : Promise.resolve(null),
  ]);

  const missing = submissionFiles.some((f) => !f);
  if (missing || submissionFiles.length === 0 || !answerKeyFile) {
    return NextResponse.json(
      { error: "Could not read the submission or answer key file" },
      { status: 500 }
    );
  }

  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  const provider = (settings?.aiProvider ?? "gemini") as AiProvider;

  try {
    const result = await gradeWithProvider(provider, {
      subject: submission.test.subject,
      chapterName: submission.test.chapterName,
      submission: submissionFiles as { data: Buffer; contentType: string }[],
      answerKey: answerKeyFile,
      questionPaper: questionPaperFile,
      model: settings?.aiModel,
    });

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        gradeStatus: "graded",
        aiScore: result.totalScore,
        aiMaxScore: result.totalMaxScore,
        aiFeedback: result as unknown as Prisma.InputJsonValue,
        gradeError: null,
        gradedAt: new Date(),
      },
    });

    return NextResponse.json({ submission: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Grading failed";
    await prisma.submission.update({
      where: { id },
      data: { gradeStatus: "error", gradeError: message.slice(0, 500) },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
