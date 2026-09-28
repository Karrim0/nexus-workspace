# Labels and Milestones

Nexus Workspace now supports two complementary ways to organize delivery work.

## Workspace labels

Labels are reusable across the active workspace and can be attached to any task. A label has a name and one of the supported visual tones.

- Owners and admins can create, rename, recolor, and delete workspace labels.
- Owners, admins, and the assigned member can attach or remove labels on a task they are allowed to manage.
- Task cards and project task lists surface assigned labels.
- The task board can be filtered by label.
- Deleting a label removes only the label assignment; tasks remain intact.

## Project milestones

Milestones belong to exactly one project and represent delivery checkpoints rather than task statuses.

- Owners and admins can create, complete, reopen, update, and delete milestones.
- A milestone can have an optional description and target date.
- Tasks can optionally be assigned to one milestone from their own project.
- Task assignees may change the milestone on tasks they are allowed to manage.
- Moving a task to another project automatically clears an incompatible milestone assignment.
- Project pages show milestone task completion progress.
- Task cards and task details surface the current milestone.
- The task board can be filtered by milestone or by tasks with no milestone.

## Data model

- `Label` is scoped to `Workspace`.
- `TaskLabel` implements the many-to-many relationship between tasks and labels.
- `Milestone` is scoped to `Project`.
- `Task.milestoneId` is optional and uses `ON DELETE SET NULL` so deleting a milestone never deletes work.

All label and milestone mutations are workspace-scoped and activity-producing where appropriate.
