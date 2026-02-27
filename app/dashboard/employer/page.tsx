"use client"

import { motion } from "framer-motion"
import {
  Users,
  Briefcase,
  Eye,
  BarChart3,
  ShieldAlert,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { DashboardTopbar } from "@/components/dashboard-topbar"
import { StatCard } from "@/components/stat-card"
import { GlassCard } from "@/components/glass-card"
import { TrustMeter } from "@/components/trust-meter"
import { RiskBadge } from "@/components/risk-badge"

// Mock data
const applicants = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Full-Stack Developer",
    trust: 94,
    risk: "low" as const,
    rate: "$85/hr",
    verified: true,
  },
  {
    id: 2,
    name: "Maria Garcia",
    role: "UI/UX Designer",
    trust: 88,
    risk: "low" as const,
    rate: "$75/hr",
    verified: true,
  },
  {
    id: 3,
    name: "James Wilson",
    role: "Backend Engineer",
    trust: 62,
    risk: "medium" as const,
    rate: "$65/hr",
    verified: true,
  },
  {
    id: 4,
    name: "Sarah Chen",
    role: "DevOps Specialist",
    trust: 91,
    risk: "low" as const,
    rate: "$90/hr",
    verified: true,
  },
  {
    id: 5,
    name: "Unknown User",
    role: "Web Developer",
    trust: 28,
    risk: "critical" as const,
    rate: "$20/hr",
    verified: false,
  },
]

const jobPostAnalytics = [
  { name: "React Developer", views: 342, applications: 48, interviews: 12 },
  { name: "UI Designer", views: 287, applications: 36, interviews: 8 },
  { name: "Data Analyst", views: 198, applications: 22, interviews: 6 },
  { name: "DevOps Engineer", views: 156, applications: 18, interviews: 5 },
]

const applicationTrend = [
  { week: "W1", apps: 12 },
  { week: "W2", apps: 19 },
  { week: "W3", apps: 24 },
  { week: "W4", apps: 18 },
  { week: "W5", apps: 32 },
  { week: "W6", apps: 28 },
  { week: "W7", apps: 45 },
  { week: "W8", apps: 38 },
]

const fraudBreakdown = [
  { name: "Verified", value: 78, color: "#34d399" },
  { name: "Under Review", value: 15, color: "#fbbf24" },
  { name: "Flagged", value: 5, color: "#f97316" },
  { name: "Rejected", value: 2, color: "#ef4444" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function EmployerDashboard() {
  return (
    <div className="flex flex-col">
      <DashboardTopbar title="Employer Dashboard" />

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
            label="Active Job Posts"
            value="6"
            icon={<Briefcase className="h-5 w-5" />}
            change="2 closing soon"
            changeType="neutral"
          />
          <StatCard
            label="Total Applicants"
            value="124"
            icon={<Users className="h-5 w-5" />}
            change="+24% this week"
            changeType="positive"
          />
          <StatCard
            label="Avg Trust Score"
            value="82.4"
            icon={<TrendingUp className="h-5 w-5" />}
            change="Above platform avg"
            changeType="positive"
          />
          <StatCard
            label="Fraud Flags"
            value="3"
            icon={<ShieldAlert className="h-5 w-5" />}
            change="-2 from last week"
            changeType="positive"
          />
        </motion.div>

        {/* Application Trend + Fraud Breakdown */}
        <motion.div
          className="grid gap-6 lg:grid-cols-3"
          variants={itemVariants}
        >
          <GlassCard hover={false} className="lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
              Application Trend
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={applicationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="week"
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
                  dataKey="apps"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ fill: "#38bdf8", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard hover={false}>
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
              Applicant Verification
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={fraudBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {fraudBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {fraudBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Job Post Analytics */}
        <motion.div variants={itemVariants}>
          <GlassCard hover={false}>
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
              Job Post Analytics
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30 text-left">
                    <th className="py-3 pr-4 font-medium text-muted-foreground">
                      Position
                    </th>
                    <th className="py-3 pr-4 font-medium text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        Views
                      </div>
                    </th>
                    <th className="py-3 pr-4 font-medium text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        Applications
                      </div>
                    </th>
                    <th className="py-3 pr-4 font-medium text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-3.5 w-3.5" />
                        Interviews
                      </div>
                    </th>
                    <th className="py-3 font-medium text-muted-foreground">
                      Conversion
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobPostAnalytics.map((job) => (
                    <tr
                      key={job.name}
                      className="border-b border-border/20 last:border-0"
                    >
                      <td className="py-3 pr-4 font-medium text-foreground">
                        {job.name}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {job.views.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {job.applications}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {job.interviews}
                      </td>
                      <td className="py-3">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {((job.interviews / job.applications) * 100).toFixed(
                            0
                          )}
                          %
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>

        {/* Applicant Trust Scores */}
        <motion.div variants={itemVariants}>
          <GlassCard hover={false}>
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
              Applicant Trust Scores
            </h3>
            <div className="space-y-3">
              {applicants.map((applicant) => (
                <motion.div
                  key={applicant.id}
                  className="flex flex-col gap-3 rounded-lg bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-4">
                    <TrustMeter score={applicant.trust} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {applicant.name}
                        </p>
                        {applicant.verified ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-red-400" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {applicant.role} &middot; {applicant.rate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RiskBadge level={applicant.risk} />
                    {applicant.risk === "critical" && (
                      <div className="flex items-center gap-1 text-xs text-red-400">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Suspected fraud
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  )
}
