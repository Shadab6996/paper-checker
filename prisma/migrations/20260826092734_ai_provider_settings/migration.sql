-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "aiModel" TEXT,
ADD COLUMN     "aiProvider" TEXT NOT NULL DEFAULT 'gemini';

-- AlterTable
ALTER TABLE "Submission" ALTER COLUMN "storagePaths" DROP DEFAULT;
