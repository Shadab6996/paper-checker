import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

export const GET = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.role !== "ADMIN" && session.sub !== submission.studentId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const index = Number(req.nextUrl.searchParams.get("index") ?? "0");
  const path = submission.storagePaths[index];
  if (!path) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await get(path, {
    access: "private",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  if (!result || result.statusCode !== 200) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-cache",
    },
  });
});
