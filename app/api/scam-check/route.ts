import { ScamCheckRequestSchema } from "@/lib/contracts/api"
import { analyzeContentForScam } from "@/lib/ai/scamDetector"
import { ok, parseBody, withErrorBoundary } from "@/lib/server/api"

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    const { content } = await parseBody(request, ScamCheckRequestSchema)
    const result = await analyzeContentForScam(content)

    return ok(result)
  })
}
