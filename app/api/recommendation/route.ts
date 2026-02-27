import { NextResponse } from "next/server";
import { rankJobsForUser } from "@/lib/ai/recommendationEngine";
import { MOCK_ZAMBIAN_USERS, mockJobs } from "@/lib/data/ZambiaData";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "user_001";
  
  const user = MOCK_ZAMBIAN_USERS.find(u => u.id === userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const recommendations = rankJobsForUser(user.skills, user.location, mockJobs);
  return NextResponse.json(recommendations);
}