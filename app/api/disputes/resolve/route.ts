import { DisputeResolveSchema } from "@/lib/contracts/api"
import { resolveMarketplaceDispute } from "@/lib/server/marketplace-service"
import { ok, parseBody, requireApiSession, withErrorBoundary } from "@/lib/server/api"

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    const session = await requireApiSession("admin")
    const payload = await parseBody(request, DisputeResolveSchema)
    const dispute = resolveMarketplaceDispute({
      adminId: session.id,
      ...payload,
    })

    return ok(dispute)
  })
}
