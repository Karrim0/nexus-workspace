CREATE TABLE "TaskSubtask" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskSubtask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TaskDependency" (
    "taskId" TEXT NOT NULL,
    "dependsOnTaskId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskDependency_pkey" PRIMARY KEY ("taskId", "dependsOnTaskId")
);

CREATE INDEX "TaskSubtask_taskId_position_idx"
ON "TaskSubtask"("taskId", "position");

CREATE INDEX "TaskDependency_dependsOnTaskId_idx"
ON "TaskDependency"("dependsOnTaskId");

ALTER TABLE "TaskSubtask"
ADD CONSTRAINT "TaskSubtask_taskId_fkey"
FOREIGN KEY ("taskId") REFERENCES "Task"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TaskDependency"
ADD CONSTRAINT "TaskDependency_taskId_fkey"
FOREIGN KEY ("taskId") REFERENCES "Task"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TaskDependency"
ADD CONSTRAINT "TaskDependency_dependsOnTaskId_fkey"
FOREIGN KEY ("dependsOnTaskId") REFERENCES "Task"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TaskDependency"
ADD CONSTRAINT "TaskDependency_no_self_dependency"
CHECK ("taskId" <> "dependsOnTaskId");
