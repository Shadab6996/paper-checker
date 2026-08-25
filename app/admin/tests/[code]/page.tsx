import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getBaseUrl } from "@/lib/url";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CopyLinkBox } from "@/components/admin/CopyLinkBox";

export default async function TestDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const test = await prisma.test.findUnique({
    where: { code },
    include: { _count: { select: { submissions: true } } },
  });
  if (!test) notFound();

  const baseUrl = await getBaseUrl();
  const link = `${baseUrl}/test/${test.code}`;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{test.name}</h1>
        <p className="text-sm text-muted-foreground">
          {test.subject} · {test.chapterName}
        </p>
      </div>

      <Card className="flex flex-col gap-3 p-6">
        <h2 className="text-sm font-semibold text-foreground">
          Shareable submission link
        </h2>
        <CopyLinkBox link={link} />
        <p className="text-xs text-muted-foreground">
          Share this with students (e.g. via WhatsApp). Opening it takes them
          straight to the upload page for this test.
        </p>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <Link href={`/admin/tests/${test.code}/submissions`}>
          <Button>
            View submissions ({test._count.submissions})
          </Button>
        </Link>
        <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Back to all tests
        </Link>
      </div>
    </div>
  );
}
