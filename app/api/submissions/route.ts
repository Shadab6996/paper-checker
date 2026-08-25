import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

const bodySchema = z.object({
  testCode: z.string().min(1),
  storagePath: z.string().min(1),
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireRole("STUDENT");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { testCode, storagePath } = parsed.data;

  const test = await prisma.test.findUnique({ where: { code: testCode } });
  if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

  const expectedPrefix = `${test.code}/`;
  if (!storagePath.startsWith(expectedPrefix)) {
    return NextResponse.json({ error: "Invalid upload path" }, { status: 400 });
  }

  const submission = await prisma.submission.create({
    data: { studentId: session.sub, testId: test.id, storagePath },
  });

  return NextResponse.json({ submission });
});
