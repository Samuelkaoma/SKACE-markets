import { RecommendationQuerySchema } from "@/lib/contracts/api"
import { rankJobsForUser } from "@/lib/ai/recommendationEngine"
import { getFreelancerById, listOpenJobs } from "@/lib/server/marketplace-repository"
import { invariant, ok, parseQuery, withErrorBoundary } from "@/lib/server/api"

export async function GET(request: Request) {
  return withErrorBoundary(async () => {
    const { userId } = parseQuery(request, RecommendationQuerySchema)
    const freelancer = getFreelancerById(userId)

    invariant(freelancer, 404, "USER_NOT_FOUND", "Freelancer profile was not found.")

    const recommendations = rankJobsForUser(
      freelancer.skills,
      freelancer.location,
      listOpenJobs(),
      freelancer.trustScore,
    )

    return ok(recommendations)
  })
}
