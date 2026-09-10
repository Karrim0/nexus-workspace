import { NextResponse } from "next/server";
import { getWorkspaceMembers } from "@/lib/workspace-repository";

export async function GET() {
  try {
    const members = await getWorkspaceMembers();

    return NextResponse.json({
      data: members,
      count: members.length,
    });
  } catch (error) {
    console.error("GET /api/team failed:", error);

    return NextResponse.json(
      {
        error: "DATABASE_ERROR",
        message: "Unable to load workspace members.",
      },
      { status: 500 }
    );
  }
}
