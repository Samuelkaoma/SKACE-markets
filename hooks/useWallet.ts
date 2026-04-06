import { useState } from "react"

import { postJson } from "@/lib/client/api"
import type { EscrowSimulationResult } from "@/lib/types"

export const useWallet = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastEscrow, setLastEscrow] = useState<EscrowSimulationResult | null>(null)

  const lockEscrow = async (amount: number, balance: number) => {
    setLoading(true)
    setError(null)

    try {
      const result = await postJson<
        EscrowSimulationResult,
        { amount: number; balance: number }
      >("/api/escrow", {
        amount,
        balance,
      })

      setLastEscrow(result)
      return result
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Escrow simulation failed. Please try again."

      setError(message)
      throw caughtError
    } finally {
      setLoading(false)
    }
  }

  return { lockEscrow, loading, error, lastEscrow }
}
