import { DisputeCreateSchema } from "@/lib/contracts/api"
import { openHireDispute } from "@/lib/server/marketplace-service"
import { ok, parseBody, requireApiSession, withErrorBoundary } from "@/lib/server/api"

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    const session = await requireApiSession()
    const payload = await parseBody(request, DisputeCreateSchema)
    const dispute = openHireDispute({
      openedByUserId: session.id,
      ...payload,
    })

    return ok(dispute, 201)
  })
}
