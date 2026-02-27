import { NextResponse } from "next/server";
import { detectAnomaly } from "@/lib/ai/anomalyEngine";

export async function POST(req: Request) {
  const { logs } = await req.json();
  const result = detectAnomaly(logs || []);
  return NextResponse.json(result);
}