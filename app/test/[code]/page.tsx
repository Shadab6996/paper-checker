import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { SubmitTestForm } from "@/components/SubmitTestForm";
import { LogoutButton } from "@/components/LogoutButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getSession } from "@/lib/auth";
import { getTestStatus } from "@/lib/testStatus";

export const dynamic = "force-dynamic";

export default async function TestSubmissionPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const test = await prisma.test.findUnique({ where: { code } });
  if (!test) notFound();

  const status = getTestStatus(test.startTime, test.endTime);
  const session = await getSession();

  let wrongSection = false;
  if (test.section && session?.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { id: session.sub } });
    wrongSection = !student || student.section !== test.section;
  }

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
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-on-primary/80">
                {test.subject}
              </p>
              <StatusBadge status={status} />
            </div>
            <h1 className="mt-1 text-xl font-bold text-on-primary">{test.name}</h1>
            <p className="mt-1 text-sm text-on-primary/90">
              Chapter: {test.chapterName}
            </p>
          </div>
          <div className="p-6">
            {wrongSection ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <p className="font-semibold text-foreground">This test isn&apos;t for your section</p>
                <p className="text-sm text-muted-foreground">
                  Contact your teacher if you think this is a mistake.
                </p>
              </div>
            ) : (
              <>
                {status === "live" && <SubmitTestForm testCode={test.code} />}
                {status === "upcoming" && (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <p className="font-semibold text-foreground">This test isn&apos;t open yet</p>
                    <p className="text-sm text-muted-foreground">
                      Opens{" "}
                      {test.startTime.toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      . Come back then.
                    </p>
                  </div>
                )}
                {status === "ended" && (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <p className="font-semibold text-foreground">This test is closed</p>
                    <p className="text-sm text-muted-foreground">
                      It closed{" "}
                      {test.endTime.toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      . Contact your teacher if you still need to submit.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {!wrongSection && (test.questionPaperShared || test.answerKeyShared) && (
          <Card className="flex flex-col gap-3 p-6">
            <h2 className="text-sm font-semibold text-foreground">Resources</h2>
            <div className="flex flex-wrap gap-3">
              {test.questionPaperShared && (
                <a
                  href={`/api/tests/${test.code}/documents/view?kind=questionPaper`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-9 cursor-pointer rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  Question paper
                </a>
              )}
              {test.answerKeyShared && (
                <a
                  href={`/api/tests/${test.code}/documents/view?kind=answerKey`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-9 cursor-pointer rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  Answer key
                </a>
              )}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
