import { redirect } from "next/navigation"

import { DemoAuthPanel } from "@/components/auth/demo-auth-panel"
import { LandingNav } from "@/components/landing-nav"
import { ParticleBackground } from "@/components/particle-background"
import { GlassCard } from "@/components/glass-card"
import { getCurrentSessionUser } from "@/lib/server/auth"
import { listDemoAccounts } from "@/lib/server/marketplace-repository"

export const dynamic = "force-dynamic"

export default async function AuthPage() {
  const session = await getCurrentSessionUser()

  if (session) {
    redirect(session.dashboardPath)
  }

  return (
    <div className="animated-gradient relative min-h-screen overflow-hidden">
      <ParticleBackground />
      <LandingNav />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-28">
        <GlassCard glow className="p-6 md:p-8">
          <DemoAuthPanel accounts={listDemoAccounts()} />
        </GlassCard>
      </div>
    </div>
  )
}
