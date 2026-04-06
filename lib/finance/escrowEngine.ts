import { randomUUID } from "node:crypto"

import type { EscrowSimulationResult } from "@/lib/types"

export interface EscrowTransaction {
  id: string
  amount: number
  status: "PENDING" | "LOCKED" | "RELEASED" | "DISPUTED"
  freelancerId: string
  employerId: string
}

export const simulateEscrowLock = (
  amount: number,
  balance: number,
): EscrowSimulationResult => {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Escrow amount must be greater than zero.")
  }

  if (!Number.isFinite(balance) || balance < 0) {
    throw new Error("Wallet balance must be zero or higher.")
  }

  if (balance < amount) {
    throw new Error("Insufficient Kwacha balance in SKACE Wallet.")
  }

  return {
    success: true,
    amount,
    newBalance: Number((balance - amount).toFixed(2)),
    escrowStatus: "LOCKED",
    holdReference: `ESC-${randomUUID().slice(0, 8).toUpperCase()}`,
    releaseEta: "Funds release after milestone approval or dispute clearance.",
    message: `K${amount.toLocaleString()} is now secured in SKACE Escrow.`,
  }
}
