import { JobCreateSchema } from "@/lib/contracts/api"
import { createMarketplaceJob } from "@/lib/server/marketplace-service"
import { ok, parseBody, requireApiSession, withErrorBoundary } from "@/lib/server/api"

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    const session = await requireApiSession("employer")
    const payload = await parseBody(request, JobCreateSchema)
    const job = createMarketplaceJob({
      employerId: session.id,
      ...payload,
    })

    return ok(job, 201)
  })
}
