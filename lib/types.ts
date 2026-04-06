export const USER_ROLES = ["freelancer", "employer", "admin"] as const
export const JOB_CATEGORIES = [
  "digital",
  "operations",
  "trade",
  "field",
] as const
export const WORK_MODES = ["remote", "hybrid", "onsite"] as const
export const RATE_TYPES = ["fixed", "hourly", "daily", "weekly"] as const
export const JOB_STATUSES = ["open", "in_progress", "completed", "cancelled"] as const
export const APPLICATION_STATUSES = [
  "applied",
  "shortlisted",
  "hired",
  "rejected",
  "withdrawn",
] as const
export const HIRE_STATUSES = ["active", "submitted", "completed", "cancelled"] as const
export const ESCROW_STATUSES = ["PENDING", "LOCKED", "RELEASED", "DISPUTED"] as const
export const DISPUTE_STATUSES = ["OPEN", "UNDER_REVIEW", "RESOLVED"] as const

export type UserRole = (typeof USER_ROLES)[number]
export type RiskLevel = "low" | "medium" | "high" | "critical"
export type VerificationState = "verified" | "review" | "unverified"
export type AvailabilityState = "open" | "limited" | "busy"
export type JobCategory = (typeof JOB_CATEGORIES)[number]
export type WorkMode = (typeof WORK_MODES)[number]
export type RateType = (typeof RATE_TYPES)[number]
export type JobStatus = (typeof JOB_STATUSES)[number]
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]
export type HireStatus = (typeof HIRE_STATUSES)[number]
export type EscrowStatus = (typeof ESCROW_STATUSES)[number]
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number]

export interface ScamResult {
  score: number
  level: RiskLevel
  reason: string
  flaggedPhrases: string[]
  recommendedActions: string[]
}

export interface TrustMetrics {
  completionRate: number
  peerReviewAvg: number
  forumActivity: number
  responseTimeMin: number
  reportCount: number
}

export interface TrustScoreBreakdown {
  score: number
  level: "foundation" | "developing" | "trusted" | "elite"
  drivers: string[]
  cautions: string[]
}

export interface UserProfile {
  id: string
  role: UserRole
  email: string
  name: string
  location: string
  currency: string
  trustScore: number
  walletBalance: number
}

export interface TrustTimelinePoint {
  period: string
  score: number
}

export interface EarningsPoint {
  period: string
  amount: number
}

export interface ActivityItem {
  id: string
  action: string
  detail: string
  timeLabel: string
}

export interface AchievementItem {
  id: string
  title: string
  description: string
  icon: "award" | "star" | "trending-up" | "briefcase" | "shield"
}

export interface Job {
  id: string
  employerId: string
  title: string
  company: string
  category: JobCategory
  tags: string[]
  location: string
  workMode: WorkMode
  remote: boolean
  rateType: RateType
  status: JobStatus
  budgetMin: number
  budgetMax: number
  currency: string
  description: string
  postedLabel: string
  postedAt: string
  views: number
  applications: number
  interviews: number
  hires: number
  applicantIds: string[]
  shiftHours: number | null
  requiresTransport: boolean
  requiresEquipment: boolean
  certifications: string[]
  tools: string[]
  experienceLevel: "entry" | "mid" | "senior"
}

export interface RecommendedJob extends Job {
  matchScore: number
  reasons: string[]
}

export interface FreelancerProfile extends UserProfile {
  role: "freelancer"
  headline: string
  bio: string
  skills: string[]
  specialties: string[]
  certifications: string[]
  tools: string[]
  jobCategories: JobCategory[]
  preferredWorkModes: WorkMode[]
  availability: AvailabilityState
  hourlyRate: number
  metrics: TrustMetrics
  trustHistory: TrustTimelinePoint[]
  earningsHistory: EarningsPoint[]
  recentActivity: ActivityItem[]
  achievements: AchievementItem[]
  verification: {
    identity: VerificationState
    skills: VerificationState
    payments: VerificationState
  }
  totalEarnings: number
  completedProjects: number
  averageReview: number
  averageResponseHours: number
}

export interface EmployerProfile extends UserProfile {
  role: "employer"
  company: string
  industry: string
  contactName: string
  monthlyHiringBudget: number
  openJobIds: string[]
  hiresThisQuarter: number
  disputeRate: number
  verification: {
    business: VerificationState
    payments: VerificationState
    compliance: VerificationState
  }
  weeklyApplications: number[]
}

export interface AdminProfile extends UserProfile {
  role: "admin"
  headline: string
}

export interface WalletSnapshot {
  currency: string
  balance: number
  heldBalance: number
  availableBalance: number
}

export interface JobApplication {
  id: string
  jobId: string
  employerId: string
  freelancerId: string
  status: ApplicationStatus
  coverLetter: string
  proposedRate: number
  rateType: RateType
  estimatedDays: number
  fitScore: number
  createdAt: string
  updatedAt: string
}

export interface MarketplaceHire {
  id: string
  jobId: string
  applicationId: string
  employerId: string
  freelancerId: string
  status: HireStatus
  amount: number
  currency: string
  scopeSummary: string
  completionSummary: string | null
  startDate: string
  submittedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface EscrowRecord {
  id: string
  hireId: string
  jobId: string
  employerId: string
  freelancerId: string
  amount: number
  currency: string
  status: EscrowStatus
  holdReference: string
  releaseEta: string
  message: string
  disputeReason: string | null
  createdAt: string
  updatedAt: string
  releasedAt: string | null
}

export interface MarketplaceReview {
  id: string
  hireId: string
  jobId: string
  authorUserId: string
  subjectUserId: string
  rating: number
  comment: string
  createdAt: string
}

export interface MarketplaceDispute {
  id: string
  escrowId: string
  hireId: string
  openedByUserId: string
  reason: string
  status: DisputeStatus
  resolution: string | null
  createdAt: string
  resolvedAt: string | null
}

export interface FraudFlag {
  id: string
  account: string
  accountId: string
  type: string
  severity: RiskLevel
  confidence: number
  detectedAt: string
  reason: string
}

export interface TrustEvent {
  id: string
  userId: string
  type: string
  effect: number
  note: string
  createdAt: string
}

export interface SessionUser {
  id: string
  role: UserRole
  name: string
  email: string
  dashboardPath: string
  summary: string
}

export interface DemoAccount extends SessionUser {
  company?: string
  headline?: string
  demoCode: string
}

export interface EscrowSimulationResult {
  success: true
  amount: number
  newBalance: number
  escrowStatus: EscrowStatus
  holdReference: string
  releaseEta: string
  message: string
}
