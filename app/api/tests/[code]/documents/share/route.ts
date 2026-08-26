import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

const bodySchema = z.object({
  kind: z.enum(["questionPaper", "answerKey"]),
  shared: z.boolean(),
});

export const POST = withErrorHandling(async (
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) => {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { kind, shared } = parsed.data;

  const { code } = await params;
  const test = await prisma.test.findUnique({ where: { code } });
  if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

  const field = kind === "questionPaper" ? "questionPaperShared" : "answerKeyShared";
  const updated = await prisma.test.update({
    where: { id: test.id },
    data: { [field]: shared },
  });

  return NextResponse.json({
    questionPaperShared: updated.questionPaperShared,
    answerKeyShared: updated.answerKeyShared,
  });
});
