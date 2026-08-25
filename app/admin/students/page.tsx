import { prisma } from "@/lib/db";
import { StudentManager } from "@/components/admin/StudentManager";
import { HeroNamesSettings } from "@/components/admin/HeroNamesSettings";

export default async function AdminStudentsPage() {
  const [students, settings] = await Promise.all([
    prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { submissions: true } } },
    }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);

  const rows = students.map((s) => ({
    id: s.id,
    name: s.name,
    section: s.section as "A" | "B",
    loginId: s.loginId,
    password: s.passwordPlain,
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
      <HeroNamesSettings
        initialNames={settings?.heroNames ?? []}
        initialQuote={
          settings?.heroQuote ?? "The best answer sheet is the one that actually gets submitted."
        }
      />
      <StudentManager initialStudents={rows} />
    </div>
  );
}
