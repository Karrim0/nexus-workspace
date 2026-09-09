import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const workspaceId = "workspace-product-team";

const users = [
  {
    id: "member-kareem",
    name: "Kareem Mostafa",
    email: "kareem@nexus.dev",
    initials: "KM",
    role: "Workspace Owner",
    status: "Active",
  },
  {
    id: "member-sara",
    name: "Sara Ahmed",
    email: "sara@nexus.dev",
    initials: "SA",
    role: "Product Designer",
    status: "Active",
  },
  {
    id: "member-youssef",
    name: "Youssef Omar",
    email: "youssef@nexus.dev",
    initials: "YO",
    role: "Backend Engineer",
    status: "Active",
  },
  {
    id: "member-mariam",
    name: "Mariam Ali",
    email: "mariam@nexus.dev",
    initials: "MA",
    role: "Frontend Engineer",
    status: "Invited",
  },
];

const projects = [
  {
    id: "website-redesign",
    name: "Website Redesign",
    description: "Rebuild the marketing website with a new responsive experience.",
    status: "In Progress",
    progress: 82,
    completedTasks: 18,
    totalTasks: 22,
    memberIds: ["member-kareem", "member-sara", "member-youssef"],
  },
  {
    id: "mobile-dashboard",
    name: "Mobile Dashboard",
    description: "Design and build a mobile-first analytics dashboard experience.",
    status: "In Progress",
    progress: 64,
    completedTasks: 14,
    totalTasks: 22,
    memberIds: ["member-kareem", "member-sara"],
  },
  {
    id: "api-integration",
    name: "API Integration",
    description: "Connect the workspace to external services and internal APIs.",
    status: "Planning",
    progress: 41,
    completedTasks: 9,
    totalTasks: 21,
    memberIds: ["member-kareem", "member-youssef"],
  },
  {
    id: "team-onboarding",
    name: "Team Onboarding",
    description: "Create a smoother onboarding experience for new workspace members.",
    status: "Planning",
    progress: 27,
    completedTasks: 6,
    totalTasks: 22,
    memberIds: ["member-sara", "member-youssef"],
  },
];

const tasks = [
  {
    id: "task-dashboard-responsive",
    title: "Finalize dashboard responsive states",
    projectId: "website-redesign",
    assigneeId: "member-kareem",
    priority: "High",
    status: "In Progress",
    dueDate: new Date("2026-09-10T12:00:00.000Z"),
  },
  {
    id: "task-onboarding-copy",
    title: "Review onboarding flow copy",
    projectId: "team-onboarding",
    assigneeId: "member-kareem",
    priority: "Medium",
    status: "Todo",
    dueDate: new Date("2026-09-11T12:00:00.000Z"),
  },
  {
    id: "task-analytics-endpoint",
    title: "Connect analytics endpoint",
    projectId: "api-integration",
    assigneeId: "member-kareem",
    priority: "High",
    status: "In Progress",
    dueDate: new Date("2026-09-12T12:00:00.000Z"),
  },
  {
    id: "task-mobile-nav",
    title: "Prepare mobile navigation states",
    projectId: "mobile-dashboard",
    assigneeId: "member-kareem",
    priority: "Low",
    status: "Todo",
    dueDate: new Date("2026-09-13T12:00:00.000Z"),
  },
  {
    id: "task-permissions-docs",
    title: "Document workspace permissions",
    projectId: "team-onboarding",
    assigneeId: "member-kareem",
    priority: "Medium",
    status: "Review",
    dueDate: new Date("2026-09-14T12:00:00.000Z"),
  },
];

const activities = [
  {
    id: "activity-1",
    userId: "member-kareem",
    message: "created Website Redesign",
    occurredAt: new Date("2026-09-10T00:10:00.000Z"),
  },
  {
    id: "activity-2",
    userId: "member-sara",
    message: "completed homepage wireframe",
    occurredAt: new Date("2026-09-09T23:40:00.000Z"),
  },
  {
    id: "activity-3",
    userId: "member-youssef",
    message: "joined Product Team",
    occurredAt: new Date("2026-09-09T22:00:00.000Z"),
  },
  {
    id: "activity-4",
    userId: "member-kareem",
    message: "updated API Integration",
    occurredAt: new Date("2026-09-09T20:00:00.000Z"),
  },
];

async function main() {
  await prisma.workspace.upsert({
    where: { slug: "product-team" },
    update: { name: "Product Team" },
    create: {
      id: workspaceId,
      name: "Product Team",
      slug: "product-team",
    },
  });

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        email: user.email,
        initials: user.initials,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        initials: user.initials,
      },
    });

    await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
      update: {
        role: user.role,
        status: user.status,
      },
      create: {
        workspaceId,
        userId: user.id,
        role: user.role,
        status: user.status,
      },
    });
  }

  for (const project of projects) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: {
        name: project.name,
        description: project.description,
        status: project.status,
        progress: project.progress,
        completedTasks: project.completedTasks,
        totalTasks: project.totalTasks,
      },
      create: {
        id: project.id,
        workspaceId,
        name: project.name,
        description: project.description,
        status: project.status,
        progress: project.progress,
        completedTasks: project.completedTasks,
        totalTasks: project.totalTasks,
      },
    });

    for (const userId of project.memberIds) {
      await prisma.projectMember.upsert({
        where: {
          projectId_userId: {
            projectId: project.id,
            userId,
          },
        },
        update: {},
        create: {
          projectId: project.id,
          userId,
        },
      });
    }
  }

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: task,
      create: task,
    });
  }

  for (const activity of activities) {
    await prisma.activity.upsert({
      where: { id: activity.id },
      update: {
        userId: activity.userId,
        message: activity.message,
        occurredAt: activity.occurredAt,
      },
      create: {
        ...activity,
        workspaceId,
      },
    });
  }

  console.log("Nexus database seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
