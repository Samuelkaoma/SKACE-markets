import { useState } from "react"

import { postJson } from "@/lib/client/api"
import type { TrustMetrics, TrustScoreBreakdown } from "@/lib/types"

interface TrustScoreResponse {
  score: number
  breakdown: TrustScoreBreakdown
  timestamp: string
}

export const useTrustScore = () => {
  const [score, setScore] = useState<number | null>(null)
  const [breakdown, setBreakdown] = useState<TrustScoreBreakdown | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchScore = async (metrics: TrustMetrics) => {
    setLoading(true)
    setError(null)

    try {
      const data = await postJson<TrustScoreResponse, TrustMetrics>("/api/trust", metrics)
      setScore(data.score)
      setBreakdown(data.breakdown)
      return data
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Trust scoring failed. Please try again."

      setError(message)
      throw caughtError
    } finally {
      setLoading(false)
    }
  }

  return { score, breakdown, fetchScore, loading, error }
}
