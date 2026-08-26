import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

export const DELETE = withErrorHandling(async (
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) => {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await params;
  const test = await prisma.test.findUnique({
    where: { code },
    include: { submissions: true },
  });
  if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

  const paths = [
    ...test.submissions.map((s) => s.storagePath),
    test.questionPaperPath,
    test.answerKeyPath,
  ].filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    await del(paths, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch(() => null);
  }

  await prisma.test.delete({ where: { id: test.id } });

  return NextResponse.json({ ok: true });
});
