import { NextResponse } from "next/server";
import { activities } from "@/lib/workspace-data";

export async function GET() {
  return NextResponse.json({
    data: activities,
    count: activities.length,
  });
}
