import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pathname = req.nextUrl.searchParams.get("pathname");
  if (!pathname) {
    return NextResponse.json({ error: "Missing pathname" }, { status: 400 });
  }

  const result = await get(pathname, { access: "private" });
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
