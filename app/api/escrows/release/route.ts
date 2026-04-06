import { EscrowFundSchema } from "@/lib/contracts/api"
import { releaseHireEscrow } from "@/lib/server/marketplace-service"
import { ok, parseBody, requireApiSession, withErrorBoundary } from "@/lib/server/api"

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    const session = await requireApiSession()
    const payload = await parseBody(request, EscrowFundSchema)
    const escrow = releaseHireEscrow({
      actorId: session.id,
      ...payload,
    })

    return ok(escrow)
  })
}
