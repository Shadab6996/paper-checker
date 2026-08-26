import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

export const GET = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const kind = req.nextUrl.searchParams.get("kind");
  if (kind !== "questionPaper" && kind !== "answerKey") {
    return NextResponse.json({ error: "Invalid document kind" }, { status: 400 });
  }

  const { code } = await params;
  const test = await prisma.test.findUnique({ where: { code } });
  if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

  const path = kind === "questionPaper" ? test.questionPaperPath : test.answerKeyPath;
  const shared = kind === "questionPaper" ? test.questionPaperShared : test.answerKeyShared;
  if (!path) return NextResponse.json({ error: "Not uploaded" }, { status: 404 });
  if (session.role !== "ADMIN" && !shared) {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

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
