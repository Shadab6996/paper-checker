-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "section" TEXT NOT NULL DEFAULT 'A';

-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "section" TEXT;

-- CreateIndex
CREATE INDEX "Student_section_idx" ON "Student"("section");
