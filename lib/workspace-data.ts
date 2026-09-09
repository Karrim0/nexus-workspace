import type {
  Activity,
  Project,
  Task,
  TeamMember,
} from "@/types/workspace";

export const teamMembers: TeamMember[] = [
  {
    id: "member-kareem",
    name: "Kareem Mostafa",
    initials: "KM",
    role: "Workspace Owner",
    email: "kareem@nexus.dev",
    status: "Active",
  },
  {
    id: "member-sara",
    name: "Sara Ahmed",
    initials: "SA",
    role: "Product Designer",
    email: "sara@nexus.dev",
    status: "Active",
  },
  {
    id: "member-youssef",
    name: "Youssef Omar",
    initials: "YO",
    role: "Backend Engineer",
    email: "youssef@nexus.dev",
    status: "Active",
  },
  {
    id: "member-mariam",
    name: "Mariam Ali",
    initials: "MA",
    role: "Frontend Engineer",
    email: "mariam@nexus.dev",
    status: "Invited",
  },
];

export const projects: Project[] = [
  {
    id: "website-redesign",
    name: "Website Redesign",
    description: "Rebuild the marketing website with a new responsive experience.",
    progress: 82,
    status: "In Progress",
    completedTasks: 18,
    totalTasks: 22,
    memberIds: ["member-kareem", "member-sara", "member-youssef"],
  },
  {
    id: "mobile-dashboard",
    name: "Mobile Dashboard",
    description: "Design and build a mobile-first analytics dashboard experience.",
    progress: 64,
    status: "In Progress",
    completedTasks: 14,
    totalTasks: 22,
    memberIds: ["member-kareem", "member-sara"],
  },
  {
    id: "api-integration",
    name: "API Integration",
    description: "Connect the workspace to external services and internal APIs.",
    progress: 41,
    status: "Planning",
    completedTasks: 9,
    totalTasks: 21,
    memberIds: ["member-kareem", "member-youssef"],
  },
  {
    id: "team-onboarding",
    name: "Team Onboarding",
    description: "Create a smoother onboarding experience for new workspace members.",
    progress: 27,
    status: "Planning",
    completedTasks: 6,
    totalTasks: 22,
    memberIds: ["member-sara", "member-youssef"],
  },
];

export const tasks: Task[] = [
  {
    id: "task-dashboard-responsive",
    title: "Finalize dashboard responsive states",
    projectId: "website-redesign",
    assigneeId: "member-kareem",
    priority: "High",
    status: "In Progress",
    dueDate: "Sep 10",
  },
  {
    id: "task-onboarding-copy",
    title: "Review onboarding flow copy",
    projectId: "team-onboarding",
    assigneeId: "member-kareem",
    priority: "Medium",
    status: "Todo",
    dueDate: "Sep 11",
  },
  {
    id: "task-analytics-endpoint",
    title: "Connect analytics endpoint",
    projectId: "api-integration",
    assigneeId: "member-kareem",
    priority: "High",
    status: "In Progress",
    dueDate: "Sep 12",
  },
  {
    id: "task-mobile-nav",
    title: "Prepare mobile navigation states",
    projectId: "mobile-dashboard",
    assigneeId: "member-kareem",
    priority: "Low",
    status: "Todo",
    dueDate: "Sep 13",
  },
  {
    id: "task-permissions-docs",
    title: "Document workspace permissions",
    projectId: "team-onboarding",
    assigneeId: "member-kareem",
    priority: "Medium",
    status: "Review",
    dueDate: "Sep 14",
  },
];

export const activities: Activity[] = [
  {
    id: "activity-1",
    memberId: "member-kareem",
    message: "created Website Redesign",
    occurredAt: "12 min ago",
  },
  {
    id: "activity-2",
    memberId: "member-sara",
    message: "completed homepage wireframe",
    occurredAt: "42 min ago",
  },
  {
    id: "activity-3",
    memberId: "member-youssef",
    message: "joined Product Team",
    occurredAt: "2 hours ago",
  },
  {
    id: "activity-4",
    memberId: "member-kareem",
    message: "updated API Integration",
    occurredAt: "4 hours ago",
  },
];

export function getProjectById(projectId: string) {
  return projects.find((project) => project.id === projectId);
}

export function getMemberById(memberId: string) {
  return teamMembers.find((member) => member.id === memberId);
}

export function getProjectMembers(project: Project) {
  return project.memberIds
    .map((memberId) => getMemberById(memberId))
    .filter((member): member is TeamMember => Boolean(member));
}
