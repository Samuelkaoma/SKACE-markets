"use client"

import { motion } from "framer-motion"
import { Briefcase, ShieldAlert, TrendingUp, Users, Wallet } from "lucide-react"
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { DashboardTopbar } from "@/components/dashboard-topbar"
import { EmployerWorkspace } from "@/components/dashboard/employer-workspace"
import { GlassCard } from "@/components/glass-card"
import { RiskBadge } from "@/components/risk-badge"
import { StatCard } from "@/components/stat-card"
import { TrustMeter } from "@/components/trust-meter"
import type { EmployerDashboardSnapshot } from "@/lib/server/dashboard-service"
import type { SessionUser } from "@/lib/types"

export function EmployerDashboardView({
  data,
  session,
}: {
  data: EmployerDashboardSnapshot
  session: SessionUser
}) {
  return (
    <div className="flex flex-col">
      <DashboardTopbar title="Employer Hiring Workspace" session={session} />

      <motion.div
        className="flex-1 space-y-6 p-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr]">
          <StatCard
            label={data.stats[0].label}
            value={data.stats[0].value}
            icon={<Briefcase className="h-5 w-5" />}
            change={data.stats[0].change}
            changeType={data.stats[0].changeType}
          />
          <StatCard
            label={data.stats[1].label}
            value={data.stats[1].value}
            icon={<Users className="h-5 w-5" />}
            change={data.stats[1].change}
            changeType={data.stats[1].changeType}
          />
          <StatCard
            label={data.stats[2].label}
            value={data.stats[2].value}
            icon={<TrendingUp className="h-5 w-5" />}
            change={data.stats[2].change}
            changeType={data.stats[2].changeType}
          />
          <StatCard
            label={data.stats[3].label}
            value={data.stats[3].value}
            icon={<ShieldAlert className="h-5 w-5" />}
            change={data.stats[3].change}
            changeType={data.stats[3].changeType}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <GlassCard hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{data.profile.company}</p>
                <p className="text-sm text-muted-foreground">{data.profile.name}</p>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary">
                Available: {data.profile.availableBalance}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.applicationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="week" stroke="rgba(255,255,255,0.35)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.35)" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="apps" stroke="#38bdf8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Applicant mix</h3>
                <p className="text-xs text-muted-foreground">Wallet balance: {data.profile.walletBalance}</p>
              </div>
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.verificationBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.verificationBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2">
              {data.verificationBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name} ({item.value})
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <GlassCard hover={false}>
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Top applicants</h3>
          <div className="grid gap-3 lg:grid-cols-2">
            {data.applicants.map((applicant) => (
              <div key={applicant.id} className="flex items-center justify-between rounded-2xl bg-background/30 p-4">
                <div className="flex items-center gap-4">
                  <TrustMeter score={applicant.trust} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{applicant.name}</p>
                    <p className="text-xs text-muted-foreground">{applicant.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RiskBadge level={applicant.risk} />
                  <span className="text-xs text-muted-foreground">{applicant.rate}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <EmployerWorkspace data={data} />
      </motion.div>
    </div>
  )
}
