import { NextResponse } from "next/server";
import { projects } from "@/lib/workspace-data";

export async function GET() {
  return NextResponse.json({
    data: projects,
    count: projects.length,
  });
}
