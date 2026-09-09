export type ProjectStatus = "Planning" | "In Progress" | "Completed";
export type TaskStatus = "Todo" | "In Progress" | "Review" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";
export type MemberStatus = "Active" | "Invited";

export type Project = {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: ProjectStatus;
  completedTasks: number;
  totalTasks: number;
  memberIds: string[];
};

export type Task = {
  id: string;
  title: string;
  projectId: string;
  assigneeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
};

export type TeamMember = {
  id: string;
  name: string;
  initials: string;
  role: string;
  email: string;
  status: MemberStatus;
};

export type Activity = {
  id: string;
  memberId: string;
  message: string;
  occurredAt: string;
};
