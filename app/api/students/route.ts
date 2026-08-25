import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole, hashPassword } from "@/lib/auth";
import { generateUniqueLoginId, generatePassword } from "@/lib/passwords";
import { withErrorHandling } from "@/lib/apiHandler";

const bodySchema = z.object({
  name: z.string().trim().min(1),
  section: z.enum(["A", "B"]),
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { name, section } = parsed.data;

  const loginId = await generateUniqueLoginId(name);
  const password = generatePassword();
  const passwordHash = await hashPassword(password);

  const student = await prisma.student.create({
    data: { name, section, loginId, passwordHash, passwordPlain: password },
  });

  return NextResponse.json({
    student: { id: student.id, name: student.name, section: student.section, loginId: student.loginId },
    password,
  });
});
