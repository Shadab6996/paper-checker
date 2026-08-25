import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

export const POST = withErrorHandling(async (req: Request) => {
  const session = await requireRole("STUDENT");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as HandleUploadBody;

  const jsonResponse = await handleUpload({
    body,
    request: req,
    onBeforeGenerateToken: async (_pathname, clientPayload) => {
      const { testCode } = JSON.parse(clientPayload || "{}") as { testCode?: string };
      if (!testCode) throw new Error("Missing test code");

      const test = await prisma.test.findUnique({ where: { code: testCode } });
      if (!test) throw new Error("Test not found");

      return {
        addRandomSuffix: true,
        allowedContentTypes: ["image/jpeg"],
        maximumSizeInBytes: 10 * 1024 * 1024,
        tokenPayload: JSON.stringify({ studentId: session.sub, testId: test.id }),
      };
    },
    onUploadCompleted: async () => {
      // Submission rows are created by the client calling POST /api/submissions
      // right after upload() resolves, so nothing to do here. (This callback
      // also never fires on localhost without a public tunnel.)
    },
  });

  return NextResponse.json(jsonResponse);
});
