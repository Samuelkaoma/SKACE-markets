"use client"

import { motion } from "framer-motion"
import { Activity, AlertTriangle, Brain, ShieldCheck } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { AdminWorkspace } from "@/components/dashboard/admin-workspace"
import { DashboardTopbar } from "@/components/dashboard-topbar"
import { GlassCard } from "@/components/glass-card"
import { RiskBadge } from "@/components/risk-badge"
import { StatCard } from "@/components/stat-card"
import type { AdminDashboardSnapshot } from "@/lib/server/dashboard-service"
import type { SessionUser } from "@/lib/types"

export function AdminDashboardView({
  data,
  session,
}: {
  data: AdminDashboardSnapshot
  session: SessionUser
}) {
  return (
    <div className="flex flex-col">
      <DashboardTopbar title="Platform Intelligence Workspace" session={session} />

      <motion.div
        className="flex-1 space-y-6 p-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid gap-4 lg:grid-cols-4">
          <StatCard
            label={data.stats[0].label}
            value={data.stats[0].value}
            icon={<ShieldCheck className="h-5 w-5" />}
            change={data.stats[0].change}
            changeType={data.stats[0].changeType}
          />
          <StatCard
            label={data.stats[1].label}
            value={data.stats[1].value}
            icon={<AlertTriangle className="h-5 w-5" />}
            change={data.stats[1].change}
            changeType={data.stats[1].changeType}
          />
          <StatCard
            label={data.stats[2].label}
            value={data.stats[2].value}
            icon={<Activity className="h-5 w-5" />}
            change={data.stats[2].change}
            changeType={data.stats[2].changeType}
          />
          <StatCard
            label={data.stats[3].label}
            value={data.stats[3].value}
            icon={<Brain className="h-5 w-5" />}
            change={data.stats[3].change}
            changeType={data.stats[3].changeType}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <GlassCard hover={false}>
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Platform trust trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.platformTrustTrend}>
                <defs>
                  <linearGradient id="adminTrustGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.35)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.35)" fontSize={12} domain={[70, 100]} />
                <Tooltip />
                <Area dataKey="index" stroke="#38bdf8" fill="url(#adminTrustGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard hover={false}>
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Decision metrics</h3>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={data.decisionMetrics}>
                <PolarGrid stroke="rgba(255,255,255,0.12)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} />
                <Radar dataKey="value" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        <GlassCard hover={false}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">Recent risk events</h3>
            <span className="text-xs text-muted-foreground">{data.recentFlags.length} current flags</span>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {data.recentFlags.map((flag) => (
              <div key={flag.id} className="rounded-2xl bg-background/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{flag.account}</p>
                    <p className="text-xs text-muted-foreground">{flag.type}</p>
                  </div>
                  <RiskBadge level={flag.severity} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{flag.reason}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Marketplace growth</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.35)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.35)" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="freelancers" stroke="#38bdf8" strokeWidth={2} />
              <Line type="monotone" dataKey="employers" stroke="#34d399" strokeWidth={2} />
              <Line type="monotone" dataKey="transactions" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <AdminWorkspace data={data} />
      </motion.div>
    </div>
  )
}
