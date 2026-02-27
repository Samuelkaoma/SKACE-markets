"use client"

import { motion } from "framer-motion"
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  TrendingUp,
  Activity,
  Brain,
  Zap,
  Target,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts"
import { DashboardTopbar } from "@/components/dashboard-topbar"
import { StatCard } from "@/components/stat-card"
import { GlassCard } from "@/components/glass-card"
import { RiskBadge } from "@/components/risk-badge"

// Mock data
const platformTrustTrend = [
  { month: "Jul", index: 74 },
  { month: "Aug", index: 76 },
  { month: "Sep", index: 78 },
  { month: "Oct", index: 77 },
  { month: "Nov", index: 81 },
  { month: "Dec", index: 83 },
  { month: "Jan", index: 86 },
  { month: "Feb", index: 89 },
]

const fraudDetectionMetrics = [
  { month: "Jul", detected: 12, blocked: 11, missed: 1 },
  { month: "Aug", detected: 18, blocked: 17, missed: 1 },
  { month: "Sep", detected: 8, blocked: 8, missed: 0 },
  { month: "Oct", detected: 22, blocked: 21, missed: 1 },
  { month: "Nov", detected: 15, blocked: 15, missed: 0 },
  { month: "Dec", detected: 9, blocked: 9, missed: 0 },
  { month: "Jan", detected: 14, blocked: 14, missed: 0 },
  { month: "Feb", detected: 6, blocked: 6, missed: 0 },
]

const growthData = [
  { month: "Jul", freelancers: 8200, employers: 3100, transactions: 12400 },
  { month: "Aug", freelancers: 9100, employers: 3400, transactions: 14200 },
  { month: "Sep", freelancers: 10300, employers: 3800, transactions: 16800 },
  { month: "Oct", freelancers: 11800, employers: 4200, transactions: 19600 },
  { month: "Nov", freelancers: 13500, employers: 4800, transactions: 23400 },
  { month: "Dec", freelancers: 15200, employers: 5300, transactions: 27200 },
  { month: "Jan", freelancers: 17400, employers: 5900, transactions: 32800 },
  { month: "Feb", freelancers: 19800, employers: 6600, transactions: 38400 },
]

const aiConfidenceData = [
  { metric: "Fraud Detection", value: 99.2 },
  { metric: "Identity Verify", value: 97.8 },
  { metric: "Risk Assessment", value: 96.4 },
  { metric: "Trust Scoring", value: 98.1 },
  { metric: "Anomaly Detect", value: 95.7 },
  { metric: "Pattern Analysis", value: 97.3 },
]

const riskHeatmapData = [
  { region: "North America", low: 82, medium: 12, high: 4, critical: 2 },
  { region: "Europe", low: 78, medium: 15, high: 5, critical: 2 },
  { region: "Asia Pacific", low: 71, medium: 18, high: 8, critical: 3 },
  { region: "Latin America", low: 68, medium: 20, high: 9, critical: 3 },
  { region: "Africa", low: 65, medium: 22, high: 10, critical: 3 },
]

const recentFlags = [
  {
    id: 1,
    user: "Suspicious Account #4821",
    type: "Identity Spoofing",
    severity: "critical" as const,
    confidence: 98.2,
    time: "12m ago",
  },
  {
    id: 2,
    user: "Account #7293",
    type: "Payment Anomaly",
    severity: "high" as const,
    confidence: 94.7,
    time: "28m ago",
  },
  {
    id: 3,
    user: "Account #1547",
    type: "Review Manipulation",
    severity: "medium" as const,
    confidence: 87.3,
    time: "1h ago",
  },
  {
    id: 4,
    user: "Account #8362",
    type: "Portfolio Fabrication",
    severity: "high" as const,
    confidence: 92.1,
    time: "2h ago",
  },
  {
    id: 5,
    user: "Account #5019",
    type: "Behavioral Pattern",
    severity: "medium" as const,
    confidence: 81.6,
    time: "3h ago",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function AdminDashboard() {
  return (
    <div className="flex flex-col">
      <DashboardTopbar title="Admin Intelligence Dashboard" />

      <motion.div
        className="flex-1 space-y-6 p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Stats */}
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={itemVariants}
        >
          <StatCard
            label="Platform Trust Index"
            value="89.2"
            icon={<ShieldCheck className="h-5 w-5" />}
            change="+3.1 this month"
            changeType="positive"
          />
          <StatCard
            label="Threats Blocked"
            value="142"
            icon={<AlertTriangle className="h-5 w-5" />}
            change="100% block rate"
            changeType="positive"
          />
          <StatCard
            label="Total Users"
            value="26,400"
            icon={<Users className="h-5 w-5" />}
            change="+2,400 this month"
            changeType="positive"
          />
          <StatCard
            label="AI Confidence"
            value="97.4%"
            icon={<Brain className="h-5 w-5" />}
            change="Model v3.2 active"
            changeType="neutral"
          />
        </motion.div>

        {/* Platform Trust + AI Confidence Radar */}
        <motion.div
          className="grid gap-6 lg:grid-cols-3"
          variants={itemVariants}
        >
          <GlassCard hover={false} className="lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
              Platform Trust Index Trend
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={platformTrustTrend}>
                <defs>
                  <linearGradient id="trustIdxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                  domain={[70, 100]}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="index"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fill="url(#trustIdxGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard hover={false}>
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
              AI Confidence Metrics
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={aiConfidenceData} outerRadius="70%">
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                />
                <PolarRadiusAxis
                  domain={[90, 100]}
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }}
                />
                <Radar
                  dataKey="value"
                  stroke="#38bdf8"
                  fill="#38bdf8"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Fraud Detection + Recent Flags */}
        <motion.div
          className="grid gap-6 lg:grid-cols-2"
          variants={itemVariants}
        >
          <GlassCard hover={false}>
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
              Fraud Detection Metrics
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={fraudDetectionMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                />
                <Bar
                  dataKey="detected"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                  name="Detected"
                />
                <Bar
                  dataKey="blocked"
                  fill="#34d399"
                  radius={[4, 4, 0, 0]}
                  name="Blocked"
                />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Recent Fraud Flags
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Zap className="h-3.5 w-3.5" />
                Live monitoring
              </div>
            </div>
            <div className="space-y-3">
              {recentFlags.map((flag) => (
                <motion.div
                  key={flag.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3"
                  whileHover={{ x: 4 }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {flag.user}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {flag.type} &middot; {flag.time}
                    </p>
                  </div>
                  <div className="ml-3 flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground">
                      {flag.confidence}%
                    </span>
                    <RiskBadge level={flag.severity} />
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Risk Heatmap */}
        <motion.div variants={itemVariants}>
          <GlassCard hover={false}>
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
              Regional Risk Heatmap
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30 text-left">
                    <th className="py-3 pr-4 font-medium text-muted-foreground">
                      Region
                    </th>
                    <th className="py-3 pr-4 font-medium text-muted-foreground">
                      Low Risk
                    </th>
                    <th className="py-3 pr-4 font-medium text-muted-foreground">
                      Medium
                    </th>
                    <th className="py-3 pr-4 font-medium text-muted-foreground">
                      High
                    </th>
                    <th className="py-3 font-medium text-muted-foreground">
                      Critical
                    </th>
                    <th className="py-3 font-medium text-muted-foreground">
                      Risk Map
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {riskHeatmapData.map((row) => (
                    <tr
                      key={row.region}
                      className="border-b border-border/20 last:border-0"
                    >
                      <td className="py-3 pr-4 font-medium text-foreground">
                        {row.region}
                      </td>
                      <td className="py-3 pr-4 text-emerald-400">{row.low}%</td>
                      <td className="py-3 pr-4 text-amber-400">{row.medium}%</td>
                      <td className="py-3 pr-4 text-orange-400">{row.high}%</td>
                      <td className="py-3 pr-4 text-red-400">{row.critical}%</td>
                      <td className="py-3">
                        <div className="flex h-3 w-32 overflow-hidden rounded-full">
                          <div
                            className="bg-emerald-400"
                            style={{ width: `${row.low}%` }}
                          />
                          <div
                            className="bg-amber-400"
                            style={{ width: `${row.medium}%` }}
                          />
                          <div
                            className="bg-orange-400"
                            style={{ width: `${row.high}%` }}
                          />
                          <div
                            className="bg-red-400"
                            style={{ width: `${row.critical}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>

        {/* Growth Charts */}
        <motion.div variants={itemVariants}>
          <GlassCard hover={false}>
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
              Platform Growth
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="freelancers"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  name="Freelancers"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="employers"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  name="Employers"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="transactions"
                  stroke="#34d399"
                  strokeWidth={2}
                  name="Transactions"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#38bdf8]" />
                <span className="text-muted-foreground">Freelancers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#a78bfa]" />
                <span className="text-muted-foreground">Employers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
                <span className="text-muted-foreground">Transactions</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* AI Model Performance */}
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={itemVariants}
        >
          {[
            {
              icon: Target,
              label: "Detection Accuracy",
              value: "99.7%",
              sub: "Model v3.2",
            },
            {
              icon: Zap,
              label: "Avg Response Time",
              value: "23ms",
              sub: "Real-time processing",
            },
            {
              icon: Activity,
              label: "Models Active",
              value: "12",
              sub: "Across 6 categories",
            },
            {
              icon: Brain,
              label: "Data Points/Day",
              value: "2.4M",
              sub: "Training continuously",
            },
          ].map((metric) => (
            <GlassCard key={metric.label} className="text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <metric.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {metric.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/70">
                {metric.sub}
              </p>
            </GlassCard>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
