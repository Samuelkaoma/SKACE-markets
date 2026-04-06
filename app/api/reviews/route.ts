import { ReviewCreateSchema } from "@/lib/contracts/api"
import { submitMarketplaceReview } from "@/lib/server/marketplace-service"
import { ok, parseBody, requireApiSession, withErrorBoundary } from "@/lib/server/api"

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    const session = await requireApiSession()
    const payload = await parseBody(request, ReviewCreateSchema)
    const review = submitMarketplaceReview({
      authorUserId: session.id,
      ...payload,
    })

    return ok(review, 201)
  })
}
