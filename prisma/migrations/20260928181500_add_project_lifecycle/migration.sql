-- Normalize the legacy project states into the new lifecycle.
UPDATE "Project"
SET "status" = 'Draft'
WHERE "status" = 'Planning';

UPDATE "Project"
SET "status" = 'Active'
WHERE "status" = 'In Progress';

-- New projects start as drafts until the workspace explicitly activates them.
ALTER TABLE "Project"
ALTER COLUMN "status" SET DEFAULT 'Draft';
