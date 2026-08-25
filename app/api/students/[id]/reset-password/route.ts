import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole, hashPassword } from "@/lib/auth";
import { generatePassword } from "@/lib/passwords";
import { withErrorHandling } from "@/lib/apiHandler";

const bodySchema = z.object({
  password: z.string().trim().min(4).max(72).optional(),
});

export const POST = withErrorHandling(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
  }

  const { id } = await params;
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const password = parsed.data.password || generatePassword();
  const passwordHash = await hashPassword(password);
  await prisma.student.update({ where: { id }, data: { passwordHash, passwordPlain: password } });

  return NextResponse.json({ password });
});
