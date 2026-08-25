import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getTestStatus } from "@/lib/testStatus";

export const dynamic = "force-dynamic";

export default async function AdminTestsPage() {
  const tests = await prisma.test.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tests</h1>
          <p className="text-sm text-muted-foreground">
            {tests.length} test{tests.length === 1 ? "" : "s"} created
          </p>
        </div>
        <Link href="/admin/tests/new">
          <Button>New test</Button>
        </Link>
      </div>

      {tests.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-10 text-center">
          <p className="font-medium text-foreground">No tests yet</p>
          <p className="text-sm text-muted-foreground">
            Create a test to get a shareable submission link.
          </p>
          <Link href="/admin/tests/new" className="mt-2">
            <Button>Create your first test</Button>
          </Link>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {tests.map((test) => (
            <li key={test.id}>
              <Link href={`/admin/tests/${test.code}`}>
                <Card className="flex flex-wrap items-center justify-between gap-3 p-5 transition-colors hover:bg-muted">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <p className="font-semibold text-foreground">{test.name}</p>
                      <StatusBadge status={getTestStatus(test.startTime, test.endTime)} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {test.subject} · {test.chapterName}
                      {test.section && ` · Section ${test.section}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {test._count.submissions} submission
                      {test._count.submissions === 1 ? "" : "s"}
                    </span>
                    <code className="rounded-lg bg-muted px-2.5 py-1 text-xs font-mono text-foreground">
                      {test.code}
                    </code>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
