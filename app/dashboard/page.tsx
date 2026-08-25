import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { LogoutButton } from "@/components/LogoutButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getTestStatus, type TestStatus } from "@/lib/testStatus";

export const dynamic = "force-dynamic";

const statusOrder: Record<TestStatus, number> = { live: 0, upcoming: 1, ended: 2 };

export default async function DashboardPage() {
  const session = await requireRole("STUDENT");
  if (!session) redirect("/login");

  const [tests, submissions] = await Promise.all([
    prisma.test.findMany({ orderBy: { startTime: "asc" } }),
    prisma.submission.findMany({
      where: { studentId: session.sub },
      orderBy: { submittedAt: "desc" },
      include: { test: true },
    }),
  ]);

  const testsWithStatus = tests
    .map((test) => ({ test, status: getTestStatus(test.startTime, test.endTime) }))
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-4 sm:px-6">
        <div>
          <p className="text-sm font-semibold text-foreground">Paper Checker</p>
          <p className="text-xs text-muted-foreground">Signed in as {session.name}</p>
        </div>
        <LogoutButton />
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8 sm:px-6">
        <h1 className="mb-1 text-xl font-bold text-foreground">Tests</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Live tests can be opened below, or via the link your teacher shared.
        </p>

        {testsWithStatus.length === 0 ? (
          <Card className="mb-8 p-8 text-center text-sm text-muted-foreground">
            No tests have been set up yet.
          </Card>
        ) : (
          <ul className="mb-8 flex flex-col gap-3">
            {testsWithStatus.map(({ test, status }) => (
              <li key={test.id}>
                <Card className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="truncate font-semibold text-foreground">{test.name}</p>
                      <StatusBadge status={status} />
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {test.subject} · {test.chapterName}
                    </p>
                    {status === "upcoming" && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Opens{" "}
                        {test.startTime.toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    )}
                    {status === "ended" && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Closed{" "}
                        {test.endTime.toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    )}
                  </div>
                  {status === "live" ? (
                    <Link
                      href={`/test/${test.code}`}
                      className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover"
                    >
                      Open
                    </Link>
                  ) : (
                    <span className="shrink-0 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground">
                      {status === "upcoming" ? "Not open" : "Closed"}
                    </span>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}

        <h2 className="mb-1 text-lg font-bold text-foreground">Your submissions</h2>
        <p className="mb-4 text-sm text-muted-foreground">Everything you&apos;ve turned in.</p>

        {submissions.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            You haven&apos;t submitted anything yet.
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {submissions.map((s) => (
              <li key={s.id}>
                <Card className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold text-foreground">{s.test.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.test.subject} · {s.test.chapterName}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                    {s.submittedAt.toLocaleDateString("en-GB")}
                  </span>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
