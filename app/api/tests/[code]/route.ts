import { NextResponse } from "next/server";
import { z } from "zod";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

const patchSchema = z
  .object({
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const PATCH = withErrorHandling(async (
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) => {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { code } = await params;
  const test = await prisma.test.findUnique({ where: { code } });
  if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

  const updated = await prisma.test.update({
    where: { id: test.id },
    data: { startTime: parsed.data.startTime, endTime: parsed.data.endTime },
  });

  return NextResponse.json({ test: updated });
});

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
    ...test.submissions.flatMap((s) => s.storagePaths),
    test.questionPaperPath,
    test.answerKeyPath,
  ].filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    await del(paths, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch(() => null);
  }

  await prisma.test.delete({ where: { id: test.id } });

  return NextResponse.json({ ok: true });
});
