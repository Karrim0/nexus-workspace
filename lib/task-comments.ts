import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";

export function validateTaskCommentBody(input: unknown) {
  if (
    !input ||
    typeof input !== "object" ||
    !("body" in input) ||
    typeof input.body !== "string"
  ) {
    return {
      success: false as const,
      message: "Comment text is required.",
    };
  }

  const body = input.body.trim();

  if (!body) {
    return {
      success: false as const,
      message: "Comment cannot be empty.",
    };
  }

  if (body.length > 1000) {
    return {
      success: false as const,
      message: "Comment must be 1000 characters or fewer.",
    };
  }

  return {
    success: true as const,
    body,
  };
}

export async function getWorkspaceTaskComments(
  taskId: string,
  workspaceId: string
) {
  const task = await db.task.findFirst({
    where: {
      id: taskId,
      project: {
        workspaceId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!task) {
    return null;
  }

  const comments = await db.taskComment.findMany({
    where: {
      taskId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          initials: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return comments.map((comment) => ({
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    author: comment.author,
  }));
}

export async function createWorkspaceTaskComment(input: {
  taskId: string;
  workspaceId: string;
  authorId: string;
  body: string;
}) {
  const task = await db.task.findFirst({
    where: {
      id: input.taskId,
      project: {
        workspaceId: input.workspaceId,
      },
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (!task) {
    return null;
  }

  const commentId = randomUUID();
  const activityId = randomUUID();

  const [comment] = await db.$transaction([
    db.taskComment.create({
      data: {
        id: commentId,
        taskId: task.id,
        authorId: input.authorId,
        body: input.body,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            initials: true,
            email: true,
          },
        },
      },
    }),
    db.activity.create({
      data: {
        id: activityId,
        workspaceId: input.workspaceId,
        userId: input.authorId,
        message: `commented on task "${task.title}"`,
      },
    }),
  ]);

  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    author: comment.author,
  };
}

export async function updateOwnWorkspaceTaskComment(input: {
  taskId: string;
  commentId: string;
  workspaceId: string;
  authorId: string;
  body: string;
}) {
  const existing = await db.taskComment.findFirst({
    where: {
      id: input.commentId,
      taskId: input.taskId,
      authorId: input.authorId,
      task: {
        project: {
          workspaceId: input.workspaceId,
        },
      },
    },
    select: {
      id: true,
      task: {
        select: {
          title: true,
        },
      },
    },
  });

  if (!existing) {
    return null;
  }

  const [comment] = await db.$transaction([
    db.taskComment.update({
      where: {
        id: existing.id,
      },
      data: {
        body: input.body,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            initials: true,
            email: true,
          },
        },
      },
    }),
    db.activity.create({
      data: {
        id: randomUUID(),
        workspaceId: input.workspaceId,
        userId: input.authorId,
        message: `edited a comment on task "${existing.task.title}"`,
      },
    }),
  ]);

  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    author: comment.author,
  };
}

export async function deleteOwnWorkspaceTaskComment(input: {
  taskId: string;
  commentId: string;
  workspaceId: string;
  authorId: string;
}) {
  const existing = await db.taskComment.findFirst({
    where: {
      id: input.commentId,
      taskId: input.taskId,
      authorId: input.authorId,
      task: {
        project: {
          workspaceId: input.workspaceId,
        },
      },
    },
    select: {
      id: true,
      task: {
        select: {
          title: true,
        },
      },
    },
  });

  if (!existing) {
    return false;
  }

  await db.$transaction([
    db.taskComment.delete({
      where: {
        id: existing.id,
      },
    }),
    db.activity.create({
      data: {
        id: randomUUID(),
        workspaceId: input.workspaceId,
        userId: input.authorId,
        message: `deleted a comment from task "${existing.task.title}"`,
      },
    }),
  ]);

  return true;
}
