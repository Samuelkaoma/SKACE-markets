import { useState } from "react"

import { postJson } from "@/lib/client/api"
import type { ScamResult } from "@/lib/types"

export const useRiskAnalysis = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScamResult | null>(null)

  const checkContent = async (text: string) => {
    setLoading(true)
    setError(null)

    try {
      const data = await postJson<ScamResult, { content: string }>("/api/scam-check", {
        content: text,
      })

      setResult(data)
      return data
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Risk analysis failed. Please try again."

      setError(message)
      throw caughtError
    } finally {
      setLoading(false)
    }
  }

  return { checkContent, loading, error, result }
}
