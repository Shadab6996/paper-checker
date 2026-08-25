import { prisma } from "@/lib/db";
import { StudentManager } from "@/components/admin/StudentManager";

export default async function AdminStudentsPage() {
  const students = await prisma.student.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  const rows = students.map((s) => ({
    id: s.id,
    name: s.name,
    loginId: s.loginId,
    submissionCount: s._count.submissions,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Students</h1>
        <p className="text-sm text-muted-foreground">
          {students.length} student{students.length === 1 ? "" : "s"} · add, delete, or reset passwords
        </p>
      </div>
      <StudentManager initialStudents={rows} />
    </div>
  );
}
