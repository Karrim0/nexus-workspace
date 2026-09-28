ALTER TABLE "Task"
ADD COLUMN "startedAt" TIMESTAMP(3),
ADD COLUMN "completedAt" TIMESTAMP(3);

UPDATE "Task"
SET "startedAt" = COALESCE("startedAt", "updatedAt")
WHERE "status" IN ('In Progress', 'Review', 'Done');

UPDATE "Task"
SET "completedAt" = COALESCE("completedAt", "updatedAt")
WHERE "status" = 'Done';
