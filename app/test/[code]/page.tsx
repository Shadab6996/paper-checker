import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { SubmitTestForm } from "@/components/SubmitTestForm";
import { LogoutButton } from "@/components/LogoutButton";
import { getSession } from "@/lib/auth";

export default async function TestSubmissionPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const test = await prisma.test.findUnique({ where: { code } });
  if (!test) notFound();

  const session = await getSession();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-4 sm:px-6">
        <div>
          <p className="text-sm font-semibold text-foreground">Paper Checker</p>
          {session && (
            <p className="text-xs text-muted-foreground">Signed in as {session.name}</p>
          )}
        </div>
        <LogoutButton />
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <Card className="overflow-hidden p-0">
          <div className="bg-primary px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-on-primary/80">
              {test.subject}
            </p>
            <h1 className="mt-1 text-xl font-bold text-on-primary">{test.name}</h1>
            <p className="mt-1 text-sm text-on-primary/90">
              Chapter: {test.chapterName}
            </p>
          </div>
          <div className="p-6">
            <SubmitTestForm testCode={test.code} />
          </div>
        </Card>
      </main>
    </div>
  );
}
