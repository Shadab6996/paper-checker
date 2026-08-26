import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";
import { AI_PROVIDERS } from "@/lib/ai/types";

const bodySchema = z.object({
  provider: z.enum(AI_PROVIDERS),
  model: z.string().trim().max(100).optional(),
});

export const POST = withErrorHandling(async (req: Request) => {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { provider, model } = parsed.data;

  const updated = await prisma.settings.upsert({
    where: { id: "singleton" },
    update: { aiProvider: provider, aiModel: model || null },
    create: { id: "singleton", aiProvider: provider, aiModel: model || null },
  });

  return NextResponse.json({ aiProvider: updated.aiProvider, aiModel: updated.aiModel });
});
