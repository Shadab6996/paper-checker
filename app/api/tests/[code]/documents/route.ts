import { NextResponse } from "next/server";
import { z } from "zod";
import { del, put } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";
import { fetchBlobBuffer } from "@/lib/blob";
import { stripPdfEncryption } from "@/lib/pdf";

const bodySchema = z.object({
  kind: z.enum(["questionPaper", "answerKey"]),
  storagePath: z.string().min(1),
});

export const POST = withErrorHandling(async (
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) => {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { kind, storagePath } = parsed.data;

  const test = await prisma.test.findUnique({ where: { code } });
  if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

  const expectedPrefix = `documents/${test.code}/`;
  if (!storagePath.startsWith(expectedPrefix)) {
    return NextResponse.json({ error: "Invalid upload path" }, { status: 400 });
  }

  // Many exam-bank PDFs carry print/copy-restriction encryption that Gemini's
  // document ingestion rejects outright, even though the file opens fine in any
  // viewer. Strip that restriction layer right after upload so grading later
  // never trips over it. A file that needs a real (unknown) password can't be
  // fixed here — reject it now with a clear message instead of failing later
  // at grading time with a cryptic error.
  const uploaded = await fetchBlobBuffer(storagePath);
  if (uploaded?.contentType === "application/pdf") {
    const cleaned = await stripPdfEncryption(uploaded.data);
    if (!cleaned) {
      await del(storagePath, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch(() => null);
      return NextResponse.json(
        {
          error:
            "This PDF is password-protected and can't be used for AI grading. Re-save/print it without a password, or upload photos of each page instead.",
        },
        { status: 400 }
      );
    }
    if (!cleaned.equals(uploaded.data)) {
      await put(storagePath, cleaned, {
        access: "private",
        contentType: "application/pdf",
        allowOverwrite: true,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    }
  }

  const field = kind === "questionPaper" ? "questionPaperPath" : "answerKeyPath";
  const previousPath = kind === "questionPaper" ? test.questionPaperPath : test.answerKeyPath;

  const updated = await prisma.test.update({
    where: { id: test.id },
    data: { [field]: storagePath },
  });

  if (previousPath && previousPath !== storagePath) {
    await del(previousPath, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch(() => null);
  }

  return NextResponse.json({
    questionPaperPath: updated.questionPaperPath,
    answerKeyPath: updated.answerKeyPath,
  });
});
