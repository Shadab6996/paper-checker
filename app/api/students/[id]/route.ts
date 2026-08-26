import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

export const DELETE = withErrorHandling(async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: { submissions: true },
  });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const paths = student.submissions.flatMap((s) => s.storagePaths);
  if (paths.length > 0) {
    await del(paths, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch(() => null);
  }

  await prisma.student.delete({ where: { id } });

  return NextResponse.json({ ok: true });
});
