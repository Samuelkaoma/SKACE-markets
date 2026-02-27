import { NextResponse } from "next/server";
import { calculateTrustScore } from "@/lib/ai/trustScore";
import { TrustMetrics } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Mapping and validating the incoming data
    const metrics: TrustMetrics = {
      completionRate: body.completionRate ?? 0,
      peerReviewAvg: body.peerReviewAvg ?? 0,
      forumActivity: body.forumActivity ?? 0,
      responseTimeMin: body.responseTimeMin ?? 0,
      reportCount: body.reportCount ?? 0,
    };

    // Correct function call based on your import
    const score = calculateTrustScore(metrics);

    return NextResponse.json({ 
      score,
      status: "success",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Trust API Error:", error);
    return NextResponse.json(
      { error: "Failed to calculate trust score" }, 
      { status: 500 }
    );
  }
}