import { AdminDashboardView } from "@/components/dashboard/admin-dashboard-view"
import { requireRole } from "@/lib/server/auth"
import { getAdminDashboardSnapshot } from "@/lib/server/dashboard-service"

export default async function AdminDashboardPage() {
  const session = await requireRole("admin")
  return <AdminDashboardView data={getAdminDashboardSnapshot()} session={session} />
}
