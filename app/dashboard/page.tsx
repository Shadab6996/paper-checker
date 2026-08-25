import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardPage() {
  const session = await requireRole("STUDENT");
  if (!session) redirect("/login");

  const submissions = await prisma.submission.findMany({
    where: { studentId: session.sub },
    orderBy: { submittedAt: "desc" },
    include: { test: true },
  });

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
        <h1 className="mb-1 text-xl font-bold text-foreground">Your submissions</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Open the link your teacher shared to submit a new test.
        </p>

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
                    {s.submittedAt.toLocaleDateString()}
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
