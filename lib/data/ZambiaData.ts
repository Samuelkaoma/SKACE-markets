import { freelancerSeeds, jobPostings } from "@/lib/data/marketplace"

export const MOCK_ZAMBIAN_USERS = freelancerSeeds.map((freelancer) => ({
  id: freelancer.id,
  name: freelancer.name,
  location: freelancer.location,
  skills: freelancer.skills,
  trustScore: freelancer.metrics.completionRate * 100,
}))

export const mockJobs = jobPostings
