import { notFound } from "next/navigation"

import { EmployerDashboardView } from "@/components/dashboard/employer-dashboard-view"
import { requireRole } from "@/lib/server/auth"
import { getEmployerDashboardSnapshot } from "@/lib/server/dashboard-service"

export default async function EmployerDashboardPage() {
  const session = await requireRole("employer")
  const data = getEmployerDashboardSnapshot(session.id)

  if (!data) {
    notFound()
  }

  return <EmployerDashboardView data={data} session={session} />
}
