import { NextResponse } from "next/server";
import { simulateEscrowLock } from "@/lib/finance/escrowEngine";

export async function POST(req: Request) {
  try {
    const { amount, balance } = await req.json();
    const result = simulateEscrowLock(amount, balance);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}