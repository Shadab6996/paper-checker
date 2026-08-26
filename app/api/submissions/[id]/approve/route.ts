import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

const bodySchema = z.object({
  score: z.coerce.number().min(0),
  feedback: z.string().trim().min(1),
});

export const POST = withErrorHandling(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Score and feedback are required" }, { status: 400 });
  }

  const { id } = await params;
  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  const updated = await prisma.submission.update({
    where: { id },
    data: {
      finalScore: parsed.data.score,
      finalFeedback: parsed.data.feedback,
      gradeStatus: "approved",
      approvedAt: new Date(),
    },
  });

  return NextResponse.json({ submission: updated });
});
