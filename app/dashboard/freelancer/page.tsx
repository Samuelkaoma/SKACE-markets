"use client"

import { motion } from "framer-motion"
import {
  Star,
  TrendingUp,
  Briefcase,
  Clock,
  Award,
  DollarSign,
  ArrowUpRight,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { DashboardTopbar } from "@/components/dashboard-topbar"
import { StatCard } from "@/components/stat-card"
import { TrustMeter } from "@/components/trust-meter"
import { RiskBadge } from "@/components/risk-badge"
import { GlassCard } from "@/components/glass-card"

// Mock data
const trustHistory = [
  { month: "Jul", score: 72 },
  { month: "Aug", score: 75 },
  { month: "Sep", score: 78 },
  { month: "Oct", score: 74 },
  { month: "Nov", score: 82 },
  { month: "Dec", score: 85 },
  { month: "Jan", score: 88 },
  { month: "Feb", score: 91 },
]

const earningsData = [
  { month: "Jul", amount: 2400 },
  { month: "Aug", amount: 3200 },
  { month: "Sep", amount: 2800 },
  { month: "Oct", amount: 3600 },
  { month: "Nov", amount: 4200 },
  { month: "Dec", amount: 3900 },
  { month: "Jan", amount: 4800 },
  { month: "Feb", amount: 5200 },
]

const jobRecommendations = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "TechCorp Inc.",
    budget: "$5,000 - $8,000",
    match: 96,
    posted: "2h ago",
  },
  {
    id: 2,
    title: "Full-Stack Engineer",
    company: "AI Startup Labs",
    budget: "$4,000 - $6,500",
    match: 92,
    posted: "5h ago",
  },
  {
    id: 3,
    title: "UI/UX Design Lead",
    company: "DesignHub Agency",
    budget: "$3,500 - $5,000",
    match: 88,
    posted: "8h ago",
  },
  {
    id: 4,
    title: "Backend API Specialist",
    company: "FinTech Global",
    budget: "$6,000 - $9,000",
    match: 85,
    posted: "12h ago",
  },
]

const recentActivity = [
  {
    id: 1,
    action: "Completed project",
    detail: "E-Commerce Platform Redesign",
    time: "1h ago",
  },
  {
    id: 2,
    action: "Received review",
    detail: "5-star rating from TechCorp",
    time: "3h ago",
  },
  {
    id: 3,
    action: "Trust score updated",
    detail: "+3 points increase",
    time: "6h ago",
  },
  {
    id: 4,
    action: "Applied to project",
    detail: "Mobile App Development",
    time: "1d ago",
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

export default function FreelancerDashboard() {
  return (
    <div className="flex flex-col">
      <DashboardTopbar title="Freelancer Dashboard" />

      <motion.div
        className="flex-1 space-y-6 p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Stats Row */}
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={itemVariants}
        >
          <StatCard
            label="Trust Score"
            value="91/100"
            icon={<Star className="h-5 w-5" />}
            change="+3 this month"
            changeType="positive"
          />
          <StatCard
            label="Active Jobs"
            value="4"
            icon={<Briefcase className="h-5 w-5" />}
            change="2 pending review"
            changeType="neutral"
          />
          <StatCard
            label="Total Earnings"
            value="$34,200"
            icon={<DollarSign className="h-5 w-5" />}
            change="+18% vs last month"
            changeType="positive"
          />
          <StatCard
            label="Avg Response"
            value="1.2h"
            icon={<Clock className="h-5 w-5" />}
            change="Top 5% speed"
            changeType="positive"
          />
        </motion.div>

        {/* Trust Meter + AI Risk + Activity */}
        <motion.div
          className="grid gap-6 lg:grid-cols-3"
          variants={itemVariants}
        >
          {/* Trust Meter */}
          <GlassCard hover={false} className="flex flex-col items-center justify-center">
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
              Overall Trust Score
            </h3>
            <TrustMeter score={91} size="lg" />
            <div className="mt-4 flex items-center gap-4">
              <RiskBadge level="low" label="AI Risk: 2.3%" />
              <div className="flex items-center gap-1 text-xs text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" />
                Trending Up
              </div>
            </div>
          </GlassCard>

          {/* Trust History Chart */}
          <GlassCard hover={false} className="lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
              Trust Score History
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trustHistory}>
                <defs>
                  <linearGradient id="trustGrad" x1="0" y1="0" x2="0" y2="1">
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
                  domain={[60, 100]}
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
                  dataKey="score"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fill="url(#trustGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Earnings + Recommendations */}
        <motion.div
          className="grid gap-6 lg:grid-cols-2"
          variants={itemVariants}
        >
          {/* Earnings Chart */}
          <GlassCard hover={false}>
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
              Monthly Earnings
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="#38bdf8"
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Job Recommendations */}
          <GlassCard hover={false}>
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
              AI Job Recommendations
            </h3>
            <div className="space-y-3">
              {jobRecommendations.map((job) => (
                <motion.div
                  key={job.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3 transition-colors hover:bg-secondary/50"
                  whileHover={{ x: 4 }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {job.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {job.company} &middot; {job.budget}
                    </p>
                  </div>
                  <div className="ml-3 flex items-center gap-3">
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {job.match}% match
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent Activity + Badges */}
        <motion.div
          className="grid gap-6 lg:grid-cols-2"
          variants={itemVariants}
        >
          {/* Recent Activity */}
          <GlassCard hover={false}>
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between border-b border-border/30 pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.detail}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Badges & Achievements */}
          <GlassCard hover={false}>
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
              Achievements
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: Award,
                  title: "Top Rated",
                  desc: "Maintained 90+ trust score",
                },
                {
                  icon: Star,
                  title: "5-Star Streak",
                  desc: "12 consecutive 5-star reviews",
                },
                {
                  icon: TrendingUp,
                  title: "Rising Star",
                  desc: "Fastest growing profile",
                },
                {
                  icon: Briefcase,
                  title: "Verified Pro",
                  desc: "Identity & skills verified",
                },
              ].map((badge) => (
                <motion.div
                  key={badge.title}
                  className="flex items-start gap-3 rounded-lg bg-secondary/30 p-3"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <badge.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      {badge.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {badge.desc}
                    </p>
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
