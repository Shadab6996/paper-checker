import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { parseAdminUsers, setSessionCookie, verifyPassword } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

const bodySchema = z.object({
  loginId: z.string().min(1),
  password: z.string().min(1),
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { loginId, password } = parsed.data;

  const admins = parseAdminUsers();
  if (admins.get(loginId) === password) {
    await setSessionCookie({ role: "ADMIN", sub: loginId, name: loginId });
    return NextResponse.json({ role: "ADMIN" });
  }

  const student = await prisma.student.findUnique({ where: { loginId } });
  if (student && (await verifyPassword(password, student.passwordHash))) {
    await setSessionCookie({
      role: "STUDENT",
      sub: student.id,
      name: student.name,
    });
    return NextResponse.json({ role: "STUDENT" });
  }

  return NextResponse.json({ error: "Invalid login ID or password" }, { status: 401 });
});
