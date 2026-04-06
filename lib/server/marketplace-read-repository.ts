import { formatDistanceToNow } from "date-fns"

import { platformSignals } from "@/lib/data/demo-signals"
import { demoAccounts } from "@/lib/data/demo-users"
import { clearAndReseedDatabase, fromSqlBoolean, getDatabase, parseJson } from "@/lib/server/database"
import type {
  AchievementItem,
  ActivityItem,
  DemoAccount,
  EmployerProfile,
  EscrowRecord,
  FreelancerProfile,
  FraudFlag,
  Job,
  MarketplaceDispute,
  MarketplaceHire,
  MarketplaceReview,
  SessionUser,
  TrustEvent,
  TrustMetrics,
  TrustTimelinePoint,
  WalletSnapshot,
} from "@/lib/types"

export interface FreelancerOption {
  id: string
  name: string
  headline: string
  location: string
  trustScore: number
}

export interface ApplicationRecord {
  id: string
  jobId: string
  employerId: string
  freelancerId: string
  status: string
  coverLetter: string
  proposedRate: number
  rateType: string
  estimatedDays: number
  fitScore: number
  createdAt: string
  updatedAt: string
  jobTitle: string
  company: string
  jobCategory: Job["category"]
  workMode: Job["workMode"]
  freelancerName: string
  freelancerHeadline: string
  freelancerTrustScore: number
  freelancerRate: number
}

export interface HireRecord extends MarketplaceHire {
  jobTitle: string
  company: string
  freelancerName: string
  employerName: string
  escrow: EscrowRecord | null
}

export interface DisputeRecord extends MarketplaceDispute {
  jobTitle: string
  company: string
  holdReference: string
  openedByName: string
}

const relativeLabel = (value: string) =>
  formatDistanceToNow(new Date(value), { addSuffix: true })

const userRows = (role?: string) => {
  const db = getDatabase()
  return role
    ? (db.prepare("SELECT * FROM users WHERE role = ? ORDER BY trust_score DESC, name ASC").all(role) as any[])
    : (db.prepare("SELECT * FROM users ORDER BY name ASC").all() as any[])
}

const jobRows = () =>
  getDatabase().prepare("SELECT * FROM jobs ORDER BY posted_at DESC").all() as any[]

const applicationRows = () =>
  getDatabase().prepare("SELECT * FROM applications ORDER BY created_at DESC").all() as any[]

const hireRows = () =>
  getDatabase().prepare("SELECT * FROM hires ORDER BY created_at DESC").all() as any[]

const escrowRows = () =>
  getDatabase().prepare("SELECT * FROM escrows ORDER BY created_at DESC").all() as any[]

const reviewRows = () =>
  getDatabase().prepare("SELECT * FROM reviews ORDER BY created_at DESC").all() as any[]

const disputeRows = () =>
  getDatabase().prepare("SELECT * FROM disputes ORDER BY created_at DESC").all() as any[]

const activityRows = (userId?: string) => {
  const db = getDatabase()
  return userId
    ? (db.prepare("SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC").all(userId) as any[])
    : (db.prepare("SELECT * FROM activity_logs ORDER BY created_at DESC").all() as any[])
}

const trustEventRows = (userId?: string) => {
  const db = getDatabase()
  return userId
    ? (db.prepare("SELECT * FROM trust_events WHERE user_id = ? ORDER BY created_at DESC").all(userId) as any[])
    : (db.prepare("SELECT * FROM trust_events ORDER BY created_at DESC").all() as any[])
}

const userRowById = (id: string) =>
  ((getDatabase().prepare("SELECT * FROM users WHERE id = ?").get(id) as any) ?? null) as any | null

const jobRowById = (id: string) =>
  ((getDatabase().prepare("SELECT * FROM jobs WHERE id = ?").get(id) as any) ?? null) as any | null

const applicationRowById = (id: string) =>
  ((getDatabase().prepare("SELECT * FROM applications WHERE id = ?").get(id) as any) ?? null) as any | null

const hireRowById = (id: string) =>
  ((getDatabase().prepare("SELECT * FROM hires WHERE id = ?").get(id) as any) ?? null) as any | null

function mapActivity(row: any): ActivityItem {
  return {
    id: row.id,
    action: row.title,
    detail: row.detail,
    timeLabel: relativeLabel(row.created_at),
  }
}

function buildMetrics(row: any): TrustMetrics {
  return {
    completionRate: row.completion_rate,
    peerReviewAvg: row.peer_review_avg,
    forumActivity: row.forum_activity,
    responseTimeMin: row.response_time_min,
    reportCount: row.report_count,
  }
}

function mapFreelancer(row: any, activities: ActivityItem[]): FreelancerProfile {
  return {
    id: row.id,
    role: "freelancer",
    email: row.email,
    name: row.name,
    location: row.location,
    currency: row.currency,
    trustScore: row.trust_score,
    walletBalance: row.wallet_balance,
    headline: row.headline ?? "Freelancer",
    bio: row.bio ?? "",
    skills: parseJson(row.skills_json, []),
    specialties: parseJson(row.specialties_json, []),
    certifications: parseJson(row.certifications_json, []),
    tools: parseJson(row.tools_json, []),
    jobCategories: parseJson(row.job_categories_json, []),
    preferredWorkModes: parseJson(row.preferred_work_modes_json, []),
    availability: row.availability ?? "open",
    hourlyRate: row.hourly_rate ?? 0,
    metrics: buildMetrics(row),
    trustHistory: parseJson<TrustTimelinePoint[]>(row.trust_history_json, []),
    earningsHistory: parseJson(row.earnings_history_json, []),
    recentActivity: activities.slice(0, 6),
    achievements: parseJson<AchievementItem[]>(row.achievements_json, []),
    verification: {
      identity: row.identity_verification ?? "unverified",
      skills: row.skills_verification ?? "unverified",
      payments: row.payments_verification ?? "unverified",
    },
    totalEarnings: row.total_earnings,
    completedProjects: row.completed_projects,
    averageReview: row.average_review,
    averageResponseHours: row.average_response_hours,
  }
}

function mapEmployer(row: any, openJobIds: string[]): EmployerProfile {
  return {
    id: row.id,
    role: "employer",
    email: row.email,
    name: row.name,
    location: row.location,
    currency: row.currency,
    trustScore: row.trust_score,
    walletBalance: row.wallet_balance,
    company: row.company ?? row.name,
    industry: row.industry ?? "General",
    contactName: row.contact_name ?? row.name,
    monthlyHiringBudget: row.monthly_hiring_budget ?? 0,
    openJobIds,
    hiresThisQuarter: row.hires_this_quarter,
    disputeRate: row.dispute_rate,
    verification: {
      business: row.business_verification ?? "unverified",
      payments: row.payments_verification ?? "unverified",
      compliance: row.compliance_verification ?? "unverified",
    },
    weeklyApplications: parseJson<number[]>(row.weekly_applications_json, []),
  }
}

function applicantMap() {
  const map = new Map<string, string[]>()
  for (const application of applicationRows()) {
    const existing = map.get(application.job_id) ?? []
    existing.push(application.freelancer_id)
    map.set(application.job_id, existing)
  }
  return map
}

function jobCountMap() {
  const map = new Map<string, { applications: number; interviews: number; hires: number }>()
  for (const application of applicationRows()) {
    const existing = map.get(application.job_id) ?? { applications: 0, interviews: 0, hires: 0 }
    existing.applications += 1
    if (application.status === "shortlisted" || application.status === "hired") {
      existing.interviews += 1
    }
    map.set(application.job_id, existing)
  }
  for (const hire of hireRows()) {
    const existing = map.get(hire.job_id) ?? { applications: 0, interviews: 0, hires: 0 }
    existing.hires += 1
    map.set(hire.job_id, existing)
  }
  return map
}

function mapJob(row: any, applicantIds: string[], counts?: { applications: number; interviews: number; hires: number }): Job {
  return {
    id: row.id,
    employerId: row.employer_id,
    title: row.title,
    company: row.company,
    category: row.category,
    tags: parseJson(row.tags_json, []),
    location: row.location,
    workMode: row.work_mode,
    remote: fromSqlBoolean(row.remote),
    rateType: row.rate_type,
    status: row.status,
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    currency: row.currency,
    description: row.description,
    postedLabel: relativeLabel(row.posted_at),
    postedAt: row.posted_at,
    views: row.views,
    applications: counts?.applications ?? row.applications,
    interviews: counts?.interviews ?? row.interviews,
    hires: counts?.hires ?? row.hires,
    applicantIds,
    shiftHours: row.shift_hours,
    requiresTransport: fromSqlBoolean(row.requires_transport),
    requiresEquipment: fromSqlBoolean(row.requires_equipment),
    certifications: parseJson(row.certifications_json, []),
    tools: parseJson(row.tools_json, []),
    experienceLevel: row.experience_level,
  }
}

function mapEscrow(row: any): EscrowRecord {
  return {
    id: row.id,
    hireId: row.hire_id,
    jobId: row.job_id,
    employerId: row.employer_id,
    freelancerId: row.freelancer_id,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    holdReference: row.hold_reference,
    releaseEta: row.release_eta,
    message: row.message,
    disputeReason: row.dispute_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    releasedAt: row.released_at,
  }
}

function sessionUsers() {
  return new Map(
    userRows().map(
      (row): [string, SessionUser] => [
        row.id,
        {
          id: row.id,
          role: row.role,
          name: row.name,
          email: row.email,
          dashboardPath:
            row.role === "employer"
              ? "/dashboard/employer"
              : row.role === "admin"
                ? "/dashboard/admin"
                : "/dashboard/freelancer",
          summary: row.headline ?? row.company ?? "Marketplace user",
        },
      ],
    ),
  )
}

export function listDemoAccounts(): DemoAccount[] {
  return demoAccounts
}

export function resetMarketplaceData() {
  clearAndReseedDatabase()
}

export function listFreelancers(): FreelancerProfile[] {
  const activities = new Map<string, ActivityItem[]>()
  for (const row of activityRows()) {
    const existing = activities.get(row.user_id) ?? []
    existing.push(mapActivity(row))
    activities.set(row.user_id, existing)
  }
  return userRows("freelancer").map((row) => mapFreelancer(row, activities.get(row.id) ?? []))
}

export function getFreelancerById(id: string) {
  const row = userRowById(id)
  if (!row || row.role !== "freelancer") return null
  return mapFreelancer(row, activityRows(id).map(mapActivity))
}

export function listFreelancerOptions(): FreelancerOption[] {
  return listFreelancers().map((freelancer) => ({
    id: freelancer.id,
    name: freelancer.name,
    headline: freelancer.headline,
    location: freelancer.location,
    trustScore: freelancer.trustScore,
  }))
}

export function listEmployers(): EmployerProfile[] {
  const openJobs = new Map<string, string[]>()
  for (const job of listJobs()) {
    if (job.status === "open" || job.status === "in_progress") {
      const existing = openJobs.get(job.employerId) ?? []
      existing.push(job.id)
      openJobs.set(job.employerId, existing)
    }
  }
  return userRows("employer").map((row) => mapEmployer(row, openJobs.get(row.id) ?? []))
}

export function getEmployerById(id: string) {
  const row = userRowById(id)
  if (!row || row.role !== "employer") return null
  const openJobIds = listJobs()
    .filter((job) => job.employerId === id && (job.status === "open" || job.status === "in_progress"))
    .map((job) => job.id)
  return mapEmployer(row, openJobIds)
}

export function listJobs(): Job[] {
  const applicants = applicantMap()
  const counts = jobCountMap()
  return jobRows().map((row) => mapJob(row, applicants.get(row.id) ?? [], counts.get(row.id)))
}

export function listOpenJobs() {
  return listJobs().filter((job) => job.status === "open")
}

export function getJobById(id: string) {
  const row = jobRowById(id)
  if (!row) return null
  const applicants = applicantMap()
  const counts = jobCountMap()
  return mapJob(row, applicants.get(id) ?? [], counts.get(id))
}

export function getJobsForEmployer(employerId: string) {
  return listJobs().filter((job) => job.employerId === employerId)
}

export function getApplicantsForEmployer(employerId: string) {
  const ids = new Set(applicationRows().filter((row) => row.employer_id === employerId).map((row) => row.freelancer_id))
  return listFreelancers().filter((freelancer) => ids.has(freelancer.id))
}

function applicationRecord(row: any, jobs: Map<string, Job>, freelancers: Map<string, FreelancerProfile>) {
  const job = jobs.get(row.job_id)
  const freelancer = freelancers.get(row.freelancer_id)
  if (!job || !freelancer) return null
  return {
    id: row.id,
    jobId: row.job_id,
    employerId: row.employer_id,
    freelancerId: row.freelancer_id,
    status: row.status,
    coverLetter: row.cover_letter,
    proposedRate: row.proposed_rate,
    rateType: row.rate_type,
    estimatedDays: row.estimated_days,
    fitScore: row.fit_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    jobTitle: job.title,
    company: job.company,
    jobCategory: job.category,
    workMode: job.workMode,
    freelancerName: freelancer.name,
    freelancerHeadline: freelancer.headline,
    freelancerTrustScore: freelancer.trustScore,
    freelancerRate: freelancer.hourlyRate,
  } satisfies ApplicationRecord
}

export function listApplicationsForEmployer(employerId: string): ApplicationRecord[] {
  const jobs = new Map(listJobs().map((job) => [job.id, job]))
  const freelancers = new Map(listFreelancers().map((freelancer) => [freelancer.id, freelancer]))
  return applicationRows()
    .filter((row) => row.employer_id === employerId)
    .map((row) => applicationRecord(row, jobs, freelancers))
    .filter((row): row is ApplicationRecord => Boolean(row))
}

export function listApplicationsForFreelancer(freelancerId: string): ApplicationRecord[] {
  const jobs = new Map(listJobs().map((job) => [job.id, job]))
  const freelancers = new Map(listFreelancers().map((freelancer) => [freelancer.id, freelancer]))
  return applicationRows()
    .filter((row) => row.freelancer_id === freelancerId)
    .map((row) => applicationRecord(row, jobs, freelancers))
    .filter((row): row is ApplicationRecord => Boolean(row))
}

export function getApplicationById(id: string) {
  const row = applicationRowById(id)
  if (!row) return null
  const jobs = new Map(listJobs().map((job) => [job.id, job]))
  const freelancers = new Map(listFreelancers().map((freelancer) => [freelancer.id, freelancer]))
  return applicationRecord(row, jobs, freelancers)
}

function hireRecord(
  row: any,
  jobs: Map<string, Job>,
  users: Map<string, SessionUser>,
  escrows: Map<string, EscrowRecord>,
) {
  const job = jobs.get(row.job_id)
  const employer = users.get(row.employer_id)
  const freelancer = users.get(row.freelancer_id)
  if (!job || !employer || !freelancer) return null
  return {
    id: row.id,
    jobId: row.job_id,
    applicationId: row.application_id,
    employerId: row.employer_id,
    freelancerId: row.freelancer_id,
    status: row.status,
    amount: row.amount,
    currency: row.currency,
    scopeSummary: row.scope_summary,
    completionSummary: row.completion_summary,
    startDate: row.start_date,
    submittedAt: row.submitted_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    jobTitle: job.title,
    company: job.company,
    freelancerName: freelancer.name,
    employerName: employer.name,
    escrow: escrows.get(row.id) ?? null,
  } satisfies HireRecord
}

export function listEscrows() {
  return escrowRows().map(mapEscrow)
}

export function getEscrowByHireId(hireId: string) {
  const row = escrowRows().find((escrow) => escrow.hire_id === hireId)
  return row ? mapEscrow(row) : null
}

export function listHiresForEmployer(employerId: string): HireRecord[] {
  const jobs = new Map(listJobs().map((job) => [job.id, job]))
  const users = sessionUsers()
  const escrows = new Map(listEscrows().map((escrow) => [escrow.hireId, escrow]))
  return hireRows()
    .filter((row) => row.employer_id === employerId)
    .map((row) => hireRecord(row, jobs, users, escrows))
    .filter((row): row is HireRecord => Boolean(row))
}

export function listHiresForFreelancer(freelancerId: string): HireRecord[] {
  const jobs = new Map(listJobs().map((job) => [job.id, job]))
  const users = sessionUsers()
  const escrows = new Map(listEscrows().map((escrow) => [escrow.hireId, escrow]))
  return hireRows()
    .filter((row) => row.freelancer_id === freelancerId)
    .map((row) => hireRecord(row, jobs, users, escrows))
    .filter((row): row is HireRecord => Boolean(row))
}

export function getHireById(id: string) {
  const row = hireRowById(id)
  if (!row) return null
  const jobs = new Map(listJobs().map((job) => [job.id, job]))
  const users = sessionUsers()
  const escrows = new Map(listEscrows().map((escrow) => [escrow.hireId, escrow]))
  return hireRecord(row, jobs, users, escrows)
}

export function listReviewsForUser(userId: string): MarketplaceReview[] {
  return reviewRows()
    .filter((row) => row.subject_user_id === userId)
    .map((row) => ({
      id: row.id,
      hireId: row.hire_id,
      jobId: row.job_id,
      authorUserId: row.author_user_id,
      subjectUserId: row.subject_user_id,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at,
    }))
}

export function listTrustEventsForUser(userId: string): TrustEvent[] {
  return trustEventRows(userId).map((row) => ({
    id: row.id,
    userId: row.user_id,
    type: row.type,
    effect: row.effect,
    note: row.note,
    createdAt: row.created_at,
  }))
}

export function listDisputes(): DisputeRecord[] {
  const jobs = new Map(listJobs().map((job) => [job.id, job]))
  const hires = new Map(hireRows().map((row) => [row.id, row]))
  const escrows = new Map(listEscrows().map((escrow) => [escrow.id, escrow]))
  const names = new Map(userRows().map((row) => [row.id, row.name]))

  return disputeRows()
    .map((row) => {
      const hire = hires.get(row.hire_id)
      const escrow = escrows.get(row.escrow_id)
      const job = hire ? jobs.get(hire.job_id) : undefined
      if (!hire || !escrow || !job) return null
      return {
        id: row.id,
        escrowId: row.escrow_id,
        hireId: row.hire_id,
        openedByUserId: row.opened_by_user_id,
        reason: row.reason,
        status: row.status,
        resolution: row.resolution,
        createdAt: row.created_at,
        resolvedAt: row.resolved_at,
        jobTitle: job.title,
        company: job.company,
        holdReference: escrow.holdReference,
        openedByName: names.get(row.opened_by_user_id) ?? "Unknown user",
      } satisfies DisputeRecord
    })
    .filter((row): row is DisputeRecord => Boolean(row))
}

export function listDisputesForUser(userId: string) {
  return listDisputes().filter((dispute) => dispute.openedByUserId === userId)
}

export function listFraudFlags(): FraudFlag[] {
  return (getDatabase().prepare("SELECT * FROM fraud_flags ORDER BY detected_at DESC").all() as any[]).map((row) => ({
    id: row.id,
    account: row.account,
    accountId: row.account_id,
    type: row.type,
    severity: row.severity,
    confidence: row.confidence,
    detectedAt: relativeLabel(row.detected_at),
    reason: row.reason,
  }))
}

export function getWalletSnapshot(userId: string): WalletSnapshot {
  const user = userRowById(userId)
  if (!user) {
    return { currency: "ZMW", balance: 0, heldBalance: 0, availableBalance: 0 }
  }
  const heldBalance =
    ((getDatabase()
      .prepare(
        `
          SELECT COALESCE(SUM(amount), 0) as total
          FROM escrows
          WHERE (employer_id = ? OR freelancer_id = ?)
            AND status IN ('LOCKED', 'DISPUTED')
        `,
      )
      .get(userId, userId) as any)?.total as number | undefined) ?? 0

  return {
    currency: user.currency,
    balance: user.wallet_balance,
    heldBalance,
    availableBalance: Math.max(user.wallet_balance - heldBalance, 0),
  }
}

export function findWalletBalance(userId: string) {
  return userRowById(userId)?.wallet_balance ?? 0
}

export function getPlatformSignals() {
  return platformSignals
}

export function getRawUserRowById(id: string) {
  return userRowById(id)
}
