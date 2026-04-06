import { HireSubmitSchema } from "@/lib/contracts/api"
import { submitHireWork } from "@/lib/server/marketplace-service"
import { ok, parseBody, requireApiSession, withErrorBoundary } from "@/lib/server/api"

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    const session = await requireApiSession("freelancer")
    const payload = await parseBody(request, HireSubmitSchema)
    const hire = submitHireWork({
      freelancerId: session.id,
      ...payload,
    })

    return ok(hire)
  })
}
