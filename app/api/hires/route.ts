import { HireCreateSchema } from "@/lib/contracts/api"
import { hireMarketplaceApplication } from "@/lib/server/marketplace-service"
import { ok, parseBody, requireApiSession, withErrorBoundary } from "@/lib/server/api"

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    const session = await requireApiSession("employer")
    const payload = await parseBody(request, HireCreateSchema)
    const hire = hireMarketplaceApplication({
      employerId: session.id,
      ...payload,
    })

    return ok(hire, 201)
  })
}
