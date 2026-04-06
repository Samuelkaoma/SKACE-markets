import { AnomalyRequestSchema } from "@/lib/contracts/api"
import { detectAnomaly } from "@/lib/ai/anomalyEngine"
import { ok, parseBody, withErrorBoundary } from "@/lib/server/api"

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    const { logs } = await parseBody(request, AnomalyRequestSchema)
    const result = detectAnomaly(logs)

    return ok(result)
  })
}
