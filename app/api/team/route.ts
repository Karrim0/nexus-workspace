import { NextResponse } from "next/server";
import { teamMembers } from "@/lib/workspace-data";

export async function GET() {
  return NextResponse.json({
    data: teamMembers,
    count: teamMembers.length,
  });
}
