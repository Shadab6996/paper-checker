import { NextResponse } from "next/server";
import { z } from "zod";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

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
