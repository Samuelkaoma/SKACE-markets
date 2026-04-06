import { EscrowFundSchema } from "@/lib/contracts/api"
import { fundHireEscrow } from "@/lib/server/marketplace-service"
import { ok, parseBody, requireApiSession, withErrorBoundary } from "@/lib/server/api"

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    const session = await requireApiSession("employer")
    const payload = await parseBody(request, EscrowFundSchema)
    const escrow = fundHireEscrow({
      employerId: session.id,
      ...payload,
    })

    return ok(escrow)
  })
}
