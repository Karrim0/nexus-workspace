import { NextResponse } from "next/server";
import { getWorkspaceActivity } from "@/lib/workspace-repository";

export async function GET() {
  try {
    const activities = await getWorkspaceActivity();

    return NextResponse.json({
      data: activities,
      count: activities.length,
    });
  } catch (error) {
    console.error("GET /api/activity failed:", error);

    return NextResponse.json(
      {
        error: "DATABASE_ERROR",
        message: "Unable to load workspace activity.",
      },
      { status: 500 }
    );
  }
}
