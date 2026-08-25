import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

const KINDS = ["questionPaper", "answerKey"] as const;

export const POST = withErrorHandling(async (
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) => {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await params;
  const body = (await req.json()) as HandleUploadBody;

  const jsonResponse = await handleUpload({
    body,
    request: req,
    onBeforeGenerateToken: async (_pathname, clientPayload) => {
      const { kind } = JSON.parse(clientPayload || "{}") as { kind?: string };
      if (!kind || !KINDS.includes(kind as (typeof KINDS)[number])) {
        throw new Error("Invalid document kind");
      }

      const test = await prisma.test.findUnique({ where: { code } });
      if (!test) throw new Error("Test not found");

      return {
        addRandomSuffix: true,
        allowedContentTypes: ["application/pdf", "image/jpeg", "image/png"],
        maximumSizeInBytes: 20 * 1024 * 1024,
        tokenPayload: JSON.stringify({ testId: test.id }),
      };
    },
    onUploadCompleted: async () => {
      // The record is saved by the client calling POST /api/tests/[code]/documents
      // right after upload() resolves (same pattern as submissions).
    },
  });

  return NextResponse.json(jsonResponse);
});
