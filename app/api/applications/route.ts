import { ApplicationCreateSchema } from "@/lib/contracts/api"
import { applyToMarketplaceJob } from "@/lib/server/marketplace-service"
import { ok, parseBody, requireApiSession, withErrorBoundary } from "@/lib/server/api"

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    const session = await requireApiSession("freelancer")
    const payload = await parseBody(request, ApplicationCreateSchema)
    const application = applyToMarketplaceJob({
      freelancerId: session.id,
      ...payload,
    })

    return ok(application, 201)
  })
}
