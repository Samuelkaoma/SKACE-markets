"use client"

import { motion } from "framer-motion"
import { Briefcase, Clock3, DollarSign, ShieldCheck, Star } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { DashboardTopbar } from "@/components/dashboard-topbar"
import { FreelancerWorkspace } from "@/components/dashboard/freelancer-workspace"
import { GlassCard } from "@/components/glass-card"
import { RiskBadge } from "@/components/risk-badge"
import { StatCard } from "@/components/stat-card"
import { TrustMeter } from "@/components/trust-meter"
import type { FreelancerDashboardSnapshot } from "@/lib/server/dashboard-service"
import type { SessionUser } from "@/lib/types"

export function FreelancerDashboardView({
  data,
  session,
}: {
  data: FreelancerDashboardSnapshot
  session: SessionUser
}) {
  return (
    <div className="flex flex-col">
      <DashboardTopbar title="Freelancer Trust Workspace" session={session} />

      <motion.div
        className="flex-1 space-y-6 p-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassCard hover={false}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{data.profile.name}</p>
                <p className="text-sm text-muted-foreground">{data.profile.headline}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.profile.certifications.slice(0, 3).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
                    >
                      {item}
                    </span>
                  ))}
                  {data.profile.tools.slice(0, 3).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-secondary px-2.5 py-1 text-xs text-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center gap-3">
                <TrustMeter score={data.trustScore} size="md" />
                <RiskBadge level={data.currentRisk} />
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label={data.stats[0].label}
              value={data.stats[0].value}
              icon={<Star className="h-5 w-5" />}
              change={data.stats[0].change}
              changeType={data.stats[0].changeType}
            />
            <StatCard
              label={data.stats[1].label}
              value={data.stats[1].value}
              icon={<Briefcase className="h-5 w-5" />}
              change={data.stats[1].change}
              changeType={data.stats[1].changeType}
            />
            <StatCard
              label={data.stats[2].label}
              value={data.stats[2].value}
              icon={<DollarSign className="h-5 w-5" />}
              change={data.stats[2].change}
              changeType={data.stats[2].changeType}
            />
            <StatCard
              label={data.stats[3].label}
              value={data.stats[3].value}
              icon={<Clock3 className="h-5 w-5" />}
              change={data.stats[3].change}
              changeType={data.stats[3].changeType}
            />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <GlassCard hover={false}>
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Trust trajectory</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.trustHistory}>
                <defs>
                  <linearGradient id="trustGradNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.35)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.35)" fontSize={12} domain={[60, 100]} />
                <Tooltip />
                <Area dataKey="score" stroke="#38bdf8" fill="url(#trustGradNew)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Earnings momentum</h3>
                <p className="text-xs text-muted-foreground">
                  Wallet balance: {data.profile.walletBalance} · Protected pipeline: {data.profile.protectedPipeline}
                </p>
              </div>
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.earningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.35)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.35)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="amount" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        <FreelancerWorkspace data={data} />
      </motion.div>
    </div>
  )
}
