-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "heroQuote" TEXT NOT NULL DEFAULT 'The best answer sheet is the one that actually gets submitted.';

-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "answerKeyPath" TEXT,
ADD COLUMN     "questionPaperPath" TEXT;
