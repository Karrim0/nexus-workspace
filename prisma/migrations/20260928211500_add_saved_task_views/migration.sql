-- Persist personal task filters as reusable workspace views.
CREATE TABLE "SavedTaskView" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "query" TEXT NOT NULL DEFAULT '',
    "projectId" TEXT,
    "priority" TEXT,
    "status" TEXT,
    "labelId" TEXT,
    "milestoneId" TEXT,
    "due" TEXT NOT NULL DEFAULT 'all',
    "sort" TEXT NOT NULL DEFAULT 'due-asc',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedTaskView_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SavedTaskView_workspaceId_userId_name_key"
ON "SavedTaskView"("workspaceId", "userId", "name");

CREATE INDEX "SavedTaskView_workspaceId_userId_updatedAt_idx"
ON "SavedTaskView"("workspaceId", "userId", "updatedAt");

ALTER TABLE "SavedTaskView"
ADD CONSTRAINT "SavedTaskView_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SavedTaskView"
ADD CONSTRAINT "SavedTaskView_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
