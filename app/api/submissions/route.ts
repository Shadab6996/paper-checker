import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";
import { getTestStatus } from "@/lib/testStatus";

const bodySchema = z.object({
  testCode: z.string().min(1),
  storagePaths: z.array(z.string().min(1)).min(1).max(10),
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireRole("STUDENT");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { testCode, storagePaths } = parsed.data;

  const test = await prisma.test.findUnique({ where: { code: testCode } });
  if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

  if (getTestStatus(test.startTime, test.endTime) !== "live") {
    return NextResponse.json({ error: "This test is not currently open" }, { status: 400 });
  }

  const expectedPrefix = `${test.code}/`;
  if (storagePaths.some((p) => !p.startsWith(expectedPrefix))) {
    return NextResponse.json({ error: "Invalid upload path" }, { status: 400 });
  }

  const existing = await prisma.submission.findUnique({
    where: { studentId_testId: { studentId: session.sub, testId: test.id } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You've already submitted this test" },
      { status: 400 }
    );
  }

  try {
    const submission = await prisma.submission.create({
      data: { studentId: session.sub, testId: test.id, storagePaths },
    });
    return NextResponse.json({ submission });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "You've already submitted this test" },
        { status: 400 }
      );
    }
    throw err;
  }
});
