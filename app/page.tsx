import { LandingPage } from "@/components/landing-page"
import { getHomeOverview } from "@/lib/server/dashboard-service"
import { listFreelancerOptions } from "@/lib/server/marketplace-repository"

export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <LandingPage
      overview={getHomeOverview()}
      freelancerOptions={listFreelancerOptions()}
    />
  )
}
