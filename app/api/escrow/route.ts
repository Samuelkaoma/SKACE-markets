import { EscrowRequestSchema } from "@/lib/contracts/api"
import { simulateEscrowLock } from "@/lib/finance/escrowEngine"
import { ok, parseBody, withErrorBoundary } from "@/lib/server/api"

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    const { amount, balance } = await parseBody(request, EscrowRequestSchema)
    const result = simulateEscrowLock(amount, balance)

    return ok(result)
  })
}
