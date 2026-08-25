import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { generateTestCode } from "@/lib/passwords";
import { withErrorHandling } from "@/lib/apiHandler";

const bodySchema = z
  .object({
    name: z.string().trim().min(1),
    subject: z.string().trim().min(1),
    chapterName: z.string().trim().min(1),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }
  const { name, subject, chapterName, startTime, endTime } = parsed.data;

  let code = generateTestCode(subject, chapterName);
  while (await prisma.test.findUnique({ where: { code } })) {
    code = generateTestCode(subject, chapterName);
  }

  const test = await prisma.test.create({
    data: { name, subject, chapterName, code, startTime, endTime },
  });

  return NextResponse.json({ test });
});
