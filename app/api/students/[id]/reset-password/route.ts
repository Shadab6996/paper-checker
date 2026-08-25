import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, hashPassword } from "@/lib/auth";
import { generatePassword } from "@/lib/passwords";
import { withErrorHandling } from "@/lib/apiHandler";

export const POST = withErrorHandling(async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const password = generatePassword();
  const passwordHash = await hashPassword(password);
  await prisma.student.update({ where: { id }, data: { passwordHash } });

  return NextResponse.json({ password });
});
