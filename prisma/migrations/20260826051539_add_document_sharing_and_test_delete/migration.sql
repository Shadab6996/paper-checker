-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "answerKeyShared" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "questionPaperShared" BOOLEAN NOT NULL DEFAULT false;
