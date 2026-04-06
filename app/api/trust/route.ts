import { TrustMetricsSchema } from "@/lib/contracts/api"
import { calculateTrustScore, getTrustBreakdown } from "@/lib/ai/trustScore"
import { ok, parseBody, withErrorBoundary } from "@/lib/server/api"

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    const metrics = await parseBody(request, TrustMetricsSchema)
    const score = calculateTrustScore(metrics)
    const breakdown = getTrustBreakdown(metrics)

    return ok({
      score,
      breakdown,
      timestamp: new Date().toISOString(),
    })
  })
}
