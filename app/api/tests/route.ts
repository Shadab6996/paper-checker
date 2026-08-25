import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { generateTestCode } from "@/lib/passwords";
import { withErrorHandling } from "@/lib/apiHandler";

const bodySchema = z.object({
  name: z.string().trim().min(1),
  subject: z.string().trim().min(1),
  chapterName: z.string().trim().min(1),
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { name, subject, chapterName } = parsed.data;

  let code = generateTestCode(subject, chapterName);
  while (await prisma.test.findUnique({ where: { code } })) {
    code = generateTestCode(subject, chapterName);
  }

  const test = await prisma.test.create({
    data: { name, subject, chapterName, code },
  });

  return NextResponse.json({ test });
});
