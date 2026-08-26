-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "aiFeedback" JSONB,
ADD COLUMN     "aiMaxScore" DOUBLE PRECISION,
ADD COLUMN     "aiScore" DOUBLE PRECISION,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "finalFeedback" TEXT,
ADD COLUMN     "finalScore" DOUBLE PRECISION,
ADD COLUMN     "gradeError" TEXT,
ADD COLUMN     "gradeStatus" TEXT NOT NULL DEFAULT 'ungraded',
ADD COLUMN     "gradedAt" TIMESTAMP(3);
