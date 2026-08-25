import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

const bodySchema = z.object({
  heroNames: z.array(z.string().trim().max(40)).max(5),
  heroQuote: z.string().trim().max(160),
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const heroNames = parsed.data.heroNames.filter((n) => n.length > 0);
  const heroQuote = parsed.data.heroQuote;

  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    update: { heroNames, heroQuote },
    create: { id: "singleton", heroNames, heroQuote },
  });

  return NextResponse.json({ heroNames: settings.heroNames, heroQuote: settings.heroQuote });
});
