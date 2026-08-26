import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SubmissionGallery, type SubmissionItem } from "@/components/admin/SubmissionGallery";

export const dynamic = "force-dynamic";

export default async function TestSubmissionsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const test = await prisma.test.findUnique({ where: { code } });
  if (!test) notFound();

  const submissions = await prisma.submission.findMany({
    where: { testId: test.id },
    orderBy: { submittedAt: "desc" },
    include: { student: true },
  });

  const items: SubmissionItem[] = submissions.map((s) => ({
    id: s.id,
    studentName: s.student.name,
    submittedAt: s.submittedAt.toISOString(),
    imageUrls: s.storagePaths.map((_, i) => `/api/submissions/${s.id}/image?index=${i}`),
    gradeStatus: s.gradeStatus as SubmissionItem["gradeStatus"],
    aiScore: s.aiScore,
    aiMaxScore: s.aiMaxScore,
    aiFeedback: s.aiFeedback as SubmissionItem["aiFeedback"],
    gradeError: s.gradeError,
    finalScore: s.finalScore,
    finalFeedback: s.finalFeedback,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">{test.name} — submissions</h1>
          <p className="text-sm text-muted-foreground">
            {test.subject} · {test.chapterName}
          </p>
        </div>
        <Link
          href={`/admin/tests/${test.code}`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Back to test
        </Link>
      </div>

      <SubmissionGallery items={items} hasAnswerKey={Boolean(test.answerKeyPath)} />
    </div>
  );
}
