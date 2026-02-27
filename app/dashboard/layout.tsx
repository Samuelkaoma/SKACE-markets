"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import type { ReactNode } from "react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="animated-gradient flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
