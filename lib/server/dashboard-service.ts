import { getTrustBreakdown, getTrustRiskLevel } from "@/lib/ai/trustScore"
import { rankJobsForUser } from "@/lib/ai/recommendationEngine"
import {
  getApplicantsForEmployer,
  getEmployerById,
  getFreelancerById,
  getJobsForEmployer,
  getPlatformSignals,
  getWalletSnapshot,
  listApplicationsForEmployer,
  listApplicationsForFreelancer,
  listDisputes,
  listFraudFlags,
  listFreelancers,
  listHiresForEmployer,
  listHiresForFreelancer,
  listJobs,
  listOpenJobs,
} from "@/lib/server/marketplace-repository"
import type { AchievementItem, RiskLevel } from "@/lib/types"

export interface DashboardMetric {
  label: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
}

export interface AdminDashboardSnapshot {
  stats: DashboardMetric[]
  platformTrustTrend: { month: string; index: number }[]
  fraudDetectionMetrics: { month: string; detected: number; blocked: number; missed: number }[]
  growthData: { month: string; freelancers: number; employers: number; transactions: number }[]
  decisionMetrics: { metric: string; value: number }[]
  riskHeatmapData: { region: string; low: number; medium: number; high: number; critical: number }[]
  recentFlags: ReturnType<typeof listFraudFlags>
  disputes: ReturnType<typeof listDisputes>
  modelMetrics: {
    label: string
    value: string
    sub: string
    icon: "target" | "zap" | "activity" | "brain"
  }[]
}

export interface EmployerDashboardSnapshot {
  profile: {
    name: string
    company: string
    walletBalance: string
    availableBalance: string
  }
  stats: DashboardMetric[]
  applicationTrend: { week: string; apps: number }[]
  verificationBreakdown: { name: string; value: number; color: string }[]
  jobPostAnalytics: { name: string; views: number; applications: number; interviews: number }[]
  applicants: {
    id: string
    name: string
    role: string
    trust: number
    risk: RiskLevel
    rate: string
    verified: boolean
  }[]
  jobs: ReturnType<typeof getJobsForEmployer>
  applications: ReturnType<typeof listApplicationsForEmployer>
  hires: ReturnType<typeof listHiresForEmployer>
}

export interface FreelancerDashboardSnapshot {
  profile: {
    name: string
    headline: string
    walletBalance: string
    protectedPipeline: string
    certifications: string[]
    tools: string[]
  }
  stats: DashboardMetric[]
  trustScore: number
  currentRisk: RiskLevel
  trustHistory: { month: string; score: number }[]
  earningsData: { month: string; amount: number }[]
  jobRecommendations: {
    id: string
    title: string
    company: string
    budgetMin: number
    budgetMax: number
    budget: string
    match: number
    posted: string
    workMode: string
    category: string
    reasons: string[]
  }[]
  recentActivity: { id: string; action: string; detail: string; time: string }[]
  achievements: { title: string; desc: string; icon: AchievementItem["icon"] }[]
  applications: ReturnType<typeof listApplicationsForFreelancer>
  activeHires: ReturnType<typeof listHiresForFreelancer>
}

export interface HomeOverview {
  stats: { label: string; value: string; detail: string }[]
  featuredFreelancers: {
    id: string
    name: string
    headline: string
    location: string
    trustScore: number
    availability: string
    skills: string[]
  }[]
  featuredJobs: {
    id: string
    title: string
    company: string
    location: string
    budget: string
    tags: string[]
  }[]
  operatingPrinciples: { title: string; description: string; metric: string }[]
}

function formatKwacha(amount: number) {
  return `K${amount.toLocaleString()}`
}

function formatHourlyRate(amount: number) {
  return `${formatKwacha(amount)}/hr`
}

export function getAdminDashboardSnapshot(): AdminDashboardSnapshot {
  const freelancers = listFreelancers()
  const flags = listFraudFlags()
  const disputes = listDisputes()
  const openJobs = listOpenJobs()
  const hires = freelancers.flatMap((freelancer) => listHiresForFreelancer(freelancer.id))
  const averageTrust =
    freelancers.reduce((sum, freelancer) => sum + freelancer.trustScore, 0) /
    Math.max(freelancers.length, 1)

  return {
    stats: [
      {
        label: "Platform Trust Index",
        value: averageTrust.toFixed(1),
        change: `${freelancers.filter((freelancer) => freelancer.trustScore >= 85).length} elite-ready freelancers`,
        changeType: "positive",
      },
      {
        label: "Active Protected Jobs",
        value: `${hires.filter((hire) => hire.escrow?.status === "LOCKED").length}`,
        change: `${disputes.filter((dispute) => dispute.status !== "RESOLVED").length} disputes need attention`,
        changeType: disputes.some((dispute) => dispute.status !== "RESOLVED") ? "negative" : "positive",
      },
      {
        label: "Open Jobs",
        value: `${openJobs.length}`,
        change: `${flags.length} flagged accounts on watch`,
        changeType: "neutral",
      },
      {
        label: "Fraud Flags Today",
        value: `${flags.length}`,
        change: disputes.length === 0 ? "No unresolved disputes" : `${disputes.length} total disputes logged`,
        changeType: flags.length > 2 ? "negative" : "neutral",
      },
    ],
    platformTrustTrend: getPlatformSignals().trustTrend,
    fraudDetectionMetrics: getPlatformSignals().fraudDetectionMetrics,
    growthData: getPlatformSignals().growthData,
    decisionMetrics: getPlatformSignals().decisionMetrics,
    riskHeatmapData: getPlatformSignals().riskHeatmapData,
    recentFlags: flags,
    disputes,
    modelMetrics: [
      {
        icon: "target",
        label: "Open Disputes",
        value: `${disputes.filter((dispute) => dispute.status !== "RESOLVED").length}`,
        sub: "Cases that still need operator action",
      },
      {
        icon: "zap",
        label: "Protected Escrows",
        value: `${hires.filter((hire) => hire.escrow).length}`,
        sub: "Live hires with escrow state attached",
      },
      {
        icon: "activity",
        label: "Live Applications",
        value: `${openJobs.reduce((sum, job) => sum + job.applications, 0)}`,
        sub: "Current pipeline across employers",
      },
      {
        icon: "brain",
        label: "Decision Signals",
        value: `${getPlatformSignals().decisionMetrics.length}`,
        sub: "Measured marketplace heuristics in production",
      },
    ],
  }
}

export function getEmployerDashboardSnapshot(
  employerId = "employer-001",
): EmployerDashboardSnapshot | null {
  const employer = getEmployerById(employerId)
  if (!employer) return null

  const jobs = getJobsForEmployer(employerId)
  const applicants = getApplicantsForEmployer(employerId)
  const applications = listApplicationsForEmployer(employerId)
  const hires = listHiresForEmployer(employerId)
  const wallet = getWalletSnapshot(employerId)
  const avgTrust =
    applicants.reduce((sum, applicant) => sum + applicant.trustScore, 0) /
    Math.max(applicants.length, 1)

  return {
    profile: {
      name: employer.contactName,
      company: employer.company,
      walletBalance: formatKwacha(wallet.balance),
      availableBalance: formatKwacha(wallet.availableBalance),
    },
    stats: [
      {
        label: "Open Hiring Threads",
        value: `${jobs.filter((job) => job.status === "open").length}`,
        change: `${jobs.filter((job) => job.category !== "digital").length} field or ops roles live`,
        changeType: "neutral",
      },
      {
        label: "Applications",
        value: `${applications.length}`,
        change: `${hires.length} hires currently tracked`,
        changeType: "positive",
      },
      {
        label: "Average Trust",
        value: avgTrust.toFixed(1),
        change: "Updated from live applicant signals",
        changeType: "positive",
      },
      {
        label: "Protected Spend",
        value: formatKwacha(wallet.heldBalance),
        change: hires.some((hire) => hire.escrow?.status === "DISPUTED")
          ? "A disputed escrow needs review"
          : "Escrow is operating cleanly",
        changeType: hires.some((hire) => hire.escrow?.status === "DISPUTED")
          ? "negative"
          : "positive",
      },
    ],
    applicationTrend: employer.weeklyApplications.map((apps, index) => ({
      week: `W${index + 1}`,
      apps,
    })),
    verificationBreakdown: [
      {
        name: "Verified",
        value: applicants.filter((applicant) => applicant.verification.identity === "verified").length,
        color: "#34d399",
      },
      {
        name: "Under Review",
        value: applicants.filter((applicant) => applicant.verification.skills === "review").length,
        color: "#fbbf24",
      },
      {
        name: "Field Ready",
        value: applicants.filter((applicant) => applicant.jobCategories.includes("field")).length,
        color: "#60a5fa",
      },
      {
        name: "Flagged",
        value: applicants.filter((applicant) => applicant.metrics.reportCount > 0).length,
        color: "#ef4444",
      },
    ],
    jobPostAnalytics: jobs.map((job) => ({
      name: job.title,
      views: job.views,
      applications: job.applications,
      interviews: job.interviews,
    })),
    applicants: applicants.map((applicant) => ({
      id: applicant.id,
      name: applicant.name,
      role: applicant.headline,
      trust: applicant.trustScore,
      risk: getTrustRiskLevel(applicant.trustScore),
      rate: formatHourlyRate(applicant.hourlyRate),
      verified:
        applicant.verification.identity === "verified" &&
        applicant.verification.skills === "verified",
    })),
    jobs,
    applications,
    hires,
  }
}

export function getFreelancerDashboardSnapshot(
  freelancerId = "freelancer-001",
): FreelancerDashboardSnapshot | null {
  const freelancer = getFreelancerById(freelancerId)
  if (!freelancer) return null

  const wallet = getWalletSnapshot(freelancerId)
  const applications = listApplicationsForFreelancer(freelancerId)
  const activeHires = listHiresForFreelancer(freelancerId)
  const recommendations = rankJobsForUser(
    freelancer.skills,
    freelancer.location,
    listOpenJobs(),
    freelancer.trustScore,
  )
    .filter((job) => !applications.some((application) => application.jobId === job.id))
    .slice(0, 6)

  const trustBreakdown = getTrustBreakdown(freelancer.metrics)

  return {
    profile: {
      name: freelancer.name,
      headline: freelancer.headline,
      walletBalance: formatKwacha(wallet.balance),
      protectedPipeline: formatKwacha(wallet.heldBalance),
      certifications: freelancer.certifications,
      tools: freelancer.tools,
    },
    stats: [
      {
        label: "Trust Score",
        value: `${freelancer.trustScore}/100`,
        change: `${trustBreakdown.level} marketplace standing`,
        changeType: "positive",
      },
      {
        label: "Active Hires",
        value: `${activeHires.length}`,
        change: `${applications.filter((application) => application.status === "applied").length} fresh applications sent`,
        changeType: "neutral",
      },
      {
        label: "Total Earnings",
        value: formatKwacha(freelancer.totalEarnings),
        change: `${formatKwacha(wallet.availableBalance)} available now`,
        changeType: "positive",
      },
      {
        label: "Field + Tool Ready",
        value: `${freelancer.certifications.length + freelancer.tools.length}`,
        change: `${freelancer.preferredWorkModes.join(", ")} work modes`,
        changeType: "positive",
      },
    ],
    trustScore: freelancer.trustScore,
    currentRisk: getTrustRiskLevel(freelancer.trustScore),
    trustHistory: freelancer.trustHistory.map((point) => ({
      month: point.period,
      score: point.score,
    })),
    earningsData: freelancer.earningsHistory.map((point) => ({
      month: point.period,
      amount: point.amount,
    })),
    jobRecommendations: recommendations.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      budgetMin: job.budgetMin,
      budgetMax: job.budgetMax,
      budget: `${formatKwacha(job.budgetMin)} - ${formatKwacha(job.budgetMax)}`,
      match: job.matchScore,
      posted: job.postedLabel,
      workMode: job.workMode,
      category: job.category,
      reasons: job.reasons,
    })),
    recentActivity: freelancer.recentActivity.map((activity) => ({
      id: activity.id,
      action: activity.action,
      detail: activity.detail,
      time: activity.timeLabel,
    })),
    achievements: freelancer.achievements.map((achievement) => ({
      title: achievement.title,
      desc: achievement.description,
      icon: achievement.icon,
    })),
    applications,
    activeHires,
  }
}

export function getHomeOverview(): HomeOverview {
  const freelancers = listFreelancers()
  const jobs = listOpenJobs()

  return {
    stats: [
      {
        label: "Verified talent on deck",
        value: `${freelancers.filter((freelancer) => freelancer.trustScore >= 80).length}`,
        detail: "Freelancers with live trust, identity, and delivery signals",
      },
      {
        label: "Protected pipeline",
        value: formatKwacha(
          freelancers
            .flatMap((freelancer) => listHiresForFreelancer(freelancer.id))
            .reduce((sum, hire) => sum + (hire.escrow?.amount ?? 0), 0),
        ),
        detail: "Escrow now persists as part of the marketplace workflow",
      },
      {
        label: "Blue-collar ready roles",
        value: `${jobs.filter((job) => job.category !== "digital").length}`,
        detail: "Field, operations, and trade jobs modeled alongside digital work",
      },
    ],
    featuredFreelancers: freelancers.slice(0, 3).map((freelancer) => ({
      id: freelancer.id,
      name: freelancer.name,
      headline: freelancer.headline,
      location: freelancer.location,
      trustScore: freelancer.trustScore,
      availability: freelancer.availability,
      skills: freelancer.skills.slice(0, 3),
    })),
    featuredJobs: jobs.slice(0, 3).map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.remote ? `${job.location} / Remote` : job.location,
      budget: `${formatKwacha(job.budgetMin)} - ${formatKwacha(job.budgetMax)}`,
      tags: job.tags.slice(0, 3),
    })),
    operatingPrinciples: [
      {
        title: "Trust before transactions",
        description:
          "Every workflow is built around transparent credibility, explainable scores, and safer hiring decisions.",
        metric: "Explainable trust breakdowns",
      },
      {
        title: "Blue-collar and digital in one market",
        description:
          "Shift length, transport needs, certifications, and tools now sit beside remote and fixed-price work without feeling bolted on.",
        metric: "Cross-sector job modeling",
      },
      {
        title: "Operational clarity",
        description:
          "Admins, employers, and freelancers all get purpose-built views fed by the same persisted data instead of dashboard theater.",
        metric: "Shared live repository",
      },
    ],
  }
}
