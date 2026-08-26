-- Add the new multi-photo column
ALTER TABLE "Submission" ADD COLUMN "storagePaths" TEXT[] NOT NULL DEFAULT '{}';

-- Backfill from the old single-path column
UPDATE "Submission" SET "storagePaths" = ARRAY["storagePath"];

-- Merge any duplicate (studentId, testId) rows into one submission per test,
-- preferring a row that already has a grade, and combining all photos.
WITH ranked AS (
  SELECT id, "studentId", "testId",
         ROW_NUMBER() OVER (
           PARTITION BY "studentId", "testId"
           ORDER BY (CASE WHEN "gradeStatus" <> 'ungraded' THEN 0 ELSE 1 END), "submittedAt" ASC
         ) AS rn
  FROM "Submission"
),
canonical AS (
  SELECT "studentId", "testId", id AS keep_id FROM ranked WHERE rn = 1
),
merged_paths AS (
  SELECT s."studentId", s."testId", array_agg(sp ORDER BY s."submittedAt") AS all_paths
  FROM "Submission" s, LATERAL unnest(s."storagePaths") AS sp
  GROUP BY s."studentId", s."testId"
)
UPDATE "Submission" s
SET "storagePaths" = mp.all_paths
FROM canonical c
JOIN merged_paths mp ON mp."studentId" = c."studentId" AND mp."testId" = c."testId"
WHERE s.id = c.keep_id;

DELETE FROM "Submission" s
WHERE NOT EXISTS (
  SELECT 1 FROM (
    SELECT id, "studentId", "testId",
           ROW_NUMBER() OVER (
             PARTITION BY "studentId", "testId"
             ORDER BY (CASE WHEN "gradeStatus" <> 'ungraded' THEN 0 ELSE 1 END), "submittedAt" ASC
           ) AS rn
    FROM "Submission"
  ) r
  WHERE r.id = s.id AND r.rn = 1
);

-- Drop the old single-path column
ALTER TABLE "Submission" DROP COLUMN "storagePath";

-- Enforce one submission per student per test
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_studentId_testId_key" UNIQUE ("studentId", "testId");
