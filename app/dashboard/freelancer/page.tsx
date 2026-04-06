import { notFound } from "next/navigation"

import { FreelancerDashboardView } from "@/components/dashboard/freelancer-dashboard-view"
import { requireRole } from "@/lib/server/auth"
import { getFreelancerDashboardSnapshot } from "@/lib/server/dashboard-service"

export default async function FreelancerDashboardPage() {
  const session = await requireRole("freelancer")
  const data = getFreelancerDashboardSnapshot(session.id)

  if (!data) {
    notFound()
  }

  return <FreelancerDashboardView data={data} session={session} />
}
