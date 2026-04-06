import { randomUUID } from "node:crypto"

import { findWalletBalance } from "@/lib/server/marketplace-repository"

export class WalletService {
  static async getBalance(userId: string): Promise<number> {
    return findWalletBalance(userId)
  }

  static async deposit(userId: string, amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Deposit amount must be greater than zero.")
    }

    const balance = await this.getBalance(userId)

    return {
      success: true,
      balance: Number((balance + amount).toFixed(2)),
      transactionId: `WAL-${randomUUID().slice(0, 8).toUpperCase()}`,
    }
  }

  static async withdraw(userId: string, amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Withdrawal amount must be greater than zero.")
    }

    const balance = await this.getBalance(userId)

    if (amount > balance) {
      throw new Error("Insufficient wallet balance.")
    }

    return {
      success: true,
      balance: Number((balance - amount).toFixed(2)),
      transactionId: `WAL-${randomUUID().slice(0, 8).toUpperCase()}`,
    }
  }
}
