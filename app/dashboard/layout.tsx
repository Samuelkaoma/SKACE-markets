import type { ReactNode } from "react"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { requireSessionUser } from "@/lib/server/auth"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireSessionUser()

  return (
    <div className="animated-gradient flex min-h-screen">
      <DashboardSidebar session={session} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
