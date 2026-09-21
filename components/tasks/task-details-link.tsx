"use client";

import Link from "next/link";

type TaskDetailsLinkProps = {
  taskId: string;
};

export function TaskDetailsLink({
  taskId,
}: TaskDetailsLinkProps) {
  return (
    <Link
      href={`/tasks/${taskId}`}
      className="inline-flex items-center text-xs font-medium text-zinc-500 transition hover:text-white"
    >
      Open details →
    </Link>
  );
}
