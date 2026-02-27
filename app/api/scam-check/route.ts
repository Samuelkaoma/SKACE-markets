import { NextResponse } from 'next/server';
import { analyzeContentForScam } from '@/lib/ai/scamDetector';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await analyzeContentForScam(body.content || "");
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}