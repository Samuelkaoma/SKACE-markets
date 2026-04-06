import { getDatabase, createId, nowIso, toSqlBoolean } from "@/lib/server/database"
import { getApplicationById, getEmployerById, getEscrowByHireId, getHireById, getJobById, listDisputes, listReviewsForUser } from "@/lib/server/marketplace-read-repository"
import type {
  ApplicationStatus,
  EscrowStatus,
  Job,
  RateType,
  TrustMetrics,
  TrustTimelinePoint,
  WorkMode,
} from "@/lib/types"

export interface NewJobInput {
  employerId: string
  title: string
  category: Job["category"]
  tags: string[]
  location: string
  workMode: WorkMode
  rateType: RateType
  budgetMin: number
  budgetMax: number
  currency: string
  description: string
  shiftHours: number | null
  requiresTransport: boolean
  requiresEquipment: boolean
  certifications: string[]
  tools: string[]
  experienceLevel: Job["experienceLevel"]
}

export interface NewApplicationInput {
  jobId: string
  employerId: string
  freelancerId: string
  coverLetter: string
  proposedRate: number
  rateType: RateType
  estimatedDays: number
  fitScore: number
}

export interface NewHireInput {
  jobId: string
  applicationId: string
  employerId: string
  freelancerId: string
  amount: number
  currency: string
  scopeSummary: string
}

export interface NewEscrowInput {
  hireId: string
  jobId: string
  employerId: string
  freelancerId: string
  amount: number
  currency: string
  holdReference: string
  releaseEta: string
  message: string
}

export interface NewDisputeInput {
  escrowId: string
  hireId: string
  openedByUserId: string
  reason: string
}

export interface NewReviewInput {
  hireId: string
  jobId: string
  authorUserId: string
  subjectUserId: string
  rating: number
  comment: string
}

export function createJob(input: NewJobInput) {
  const employer = getEmployerById(input.employerId)
  if (!employer) throw new Error("Employer account was not found.")

  const id = createId("job")
  const createdAt = nowIso()

  getDatabase()
    .prepare(
      `
        INSERT INTO jobs (
          id, employer_id, title, company, category, tags_json, location, work_mode, remote,
          rate_type, status, budget_min, budget_max, currency, description, posted_at, views,
          applications, interviews, hires, shift_hours, requires_transport, requires_equipment,
          certifications_json, tools_json, experience_level, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(
      id,
      input.employerId,
      input.title,
      employer.company,
      input.category,
      JSON.stringify(input.tags),
      input.location,
      input.workMode,
      toSqlBoolean(input.workMode === "remote"),
      input.rateType,
      input.budgetMin,
      input.budgetMax,
      input.currency,
      input.description,
      createdAt,
      input.shiftHours,
      toSqlBoolean(input.requiresTransport),
      toSqlBoolean(input.requiresEquipment),
      JSON.stringify(input.certifications),
      JSON.stringify(input.tools),
      input.experienceLevel,
      createdAt,
      createdAt,
    )

  return getJobById(id)
}

export function createApplication(input: NewApplicationInput) {
  const id = createId("application")
  const createdAt = nowIso()

  getDatabase()
    .prepare(
      `
        INSERT INTO applications (
          id, job_id, employer_id, freelancer_id, status, cover_letter, proposed_rate,
          rate_type, estimated_days, fit_score, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'applied', ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(
      id,
      input.jobId,
      input.employerId,
      input.freelancerId,
      input.coverLetter,
      input.proposedRate,
      input.rateType,
      input.estimatedDays,
      input.fitScore,
      createdAt,
      createdAt,
    )

  return getApplicationById(id)
}

export function updateJobStatus(id: string, status: Job["status"]) {
  getDatabase()
    .prepare("UPDATE jobs SET status = ?, updated_at = ? WHERE id = ?")
    .run(status, nowIso(), id)

  return getJobById(id)
}

export function updateApplicationStatus(id: string, status: ApplicationStatus) {
  getDatabase()
    .prepare("UPDATE applications SET status = ?, updated_at = ? WHERE id = ?")
    .run(status, nowIso(), id)

  return getApplicationById(id)
}

export function createHire(input: NewHireInput) {
  const id = createId("hire")
  const createdAt = nowIso()

  getDatabase()
    .prepare(
      `
        INSERT INTO hires (
          id, job_id, application_id, employer_id, freelancer_id, status, amount, currency,
          scope_summary, completion_summary, start_date, submitted_at, completed_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, NULL, ?, NULL, NULL, ?, ?)
      `,
    )
    .run(
      id,
      input.jobId,
      input.applicationId,
      input.employerId,
      input.freelancerId,
      input.amount,
      input.currency,
      input.scopeSummary,
      createdAt,
      createdAt,
      createdAt,
    )

  return getHireById(id)
}

export function updateHireStatus(id: string, status: string, completionSummary?: string | null) {
  const timestamp = nowIso()
  const submittedAt = status === "submitted" ? timestamp : null
  const completedAt = status === "completed" ? timestamp : null

  getDatabase()
    .prepare(
      `
        UPDATE hires
        SET status = ?,
            completion_summary = COALESCE(?, completion_summary),
            submitted_at = COALESCE(?, submitted_at),
            completed_at = COALESCE(?, completed_at),
            updated_at = ?
        WHERE id = ?
      `,
    )
    .run(status, completionSummary ?? null, submittedAt, completedAt, timestamp, id)

  return getHireById(id)
}

export function createEscrow(input: NewEscrowInput) {
  const id = createId("escrow")
  const createdAt = nowIso()

  getDatabase()
    .prepare(
      `
        INSERT INTO escrows (
          id, hire_id, job_id, employer_id, freelancer_id, amount, currency, status,
          hold_reference, release_eta, message, dispute_reason, created_at, updated_at, released_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'LOCKED', ?, ?, ?, NULL, ?, ?, NULL)
      `,
    )
    .run(
      id,
      input.hireId,
      input.jobId,
      input.employerId,
      input.freelancerId,
      input.amount,
      input.currency,
      input.holdReference,
      input.releaseEta,
      input.message,
      createdAt,
      createdAt,
    )

  return getEscrowByHireId(input.hireId)
}

export function updateEscrowStatus(hireId: string, status: EscrowStatus, disputeReason?: string | null) {
  const timestamp = nowIso()

  getDatabase()
    .prepare(
      `
        UPDATE escrows
        SET status = ?,
            dispute_reason = COALESCE(?, dispute_reason),
            updated_at = ?,
            released_at = CASE WHEN ? = 'RELEASED' THEN ? ELSE released_at END
        WHERE hire_id = ?
      `,
    )
    .run(status, disputeReason ?? null, timestamp, status, timestamp, hireId)

  return getEscrowByHireId(hireId)
}

export function createDispute(input: NewDisputeInput) {
  const id = createId("dispute")
  const createdAt = nowIso()

  getDatabase()
    .prepare(
      `
        INSERT INTO disputes (
          id, escrow_id, hire_id, opened_by_user_id, reason, status, resolution, created_at, resolved_at
        ) VALUES (?, ?, ?, ?, ?, 'OPEN', NULL, ?, NULL)
      `,
    )
    .run(id, input.escrowId, input.hireId, input.openedByUserId, input.reason, createdAt)

  return listDisputes().find((dispute) => dispute.id === id) ?? null
}

export function resolveDispute(disputeId: string, resolution: string) {
  getDatabase()
    .prepare(
      `
        UPDATE disputes
        SET status = 'RESOLVED',
            resolution = ?,
            resolved_at = ?
        WHERE id = ?
      `,
    )
    .run(resolution, nowIso(), disputeId)

  return listDisputes().find((dispute) => dispute.id === disputeId) ?? null
}

export function createReview(input: NewReviewInput) {
  const id = createId("review")

  getDatabase()
    .prepare(
      `
        INSERT INTO reviews (
          id, hire_id, job_id, author_user_id, subject_user_id, rating, comment, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(
      id,
      input.hireId,
      input.jobId,
      input.authorUserId,
      input.subjectUserId,
      input.rating,
      input.comment,
      nowIso(),
    )

  return listReviewsForUser(input.subjectUserId).find((review) => review.id === id) ?? null
}

export function addActivityLog(userId: string, title: string, detail: string, kind = "MARKETPLACE") {
  getDatabase()
    .prepare(
      `
        INSERT INTO activity_logs (id, user_id, kind, title, detail, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
    )
    .run(createId("activity"), userId, kind, title, detail, nowIso())
}

export function addTrustEvent(userId: string, type: string, effect: number, note: string) {
  getDatabase()
    .prepare(
      `
        INSERT INTO trust_events (id, user_id, type, effect, note, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
    )
    .run(createId("trust"), userId, type, effect, note, nowIso())
}

export function updateUserWalletBalance(userId: string, walletBalance: number) {
  getDatabase()
    .prepare("UPDATE users SET wallet_balance = ?, updated_at = ? WHERE id = ?")
    .run(walletBalance, nowIso(), userId)
}

export function updateEmployerSignals(
  employerId: string,
  updates: {
    walletBalance?: number
    weeklyApplications?: number[]
    hiresThisQuarter?: number
    disputeRate?: number
  },
) {
  const row = getDatabase().prepare("SELECT * FROM users WHERE id = ?").get(employerId) as any
  if (!row) return

  getDatabase()
    .prepare(
      `
        UPDATE users
        SET wallet_balance = ?,
            weekly_applications_json = ?,
            hires_this_quarter = ?,
            dispute_rate = ?,
            updated_at = ?
        WHERE id = ?
      `,
    )
    .run(
      updates.walletBalance ?? row.wallet_balance,
      JSON.stringify(updates.weeklyApplications ?? JSON.parse(row.weekly_applications_json ?? "[]")),
      updates.hiresThisQuarter ?? row.hires_this_quarter,
      updates.disputeRate ?? row.dispute_rate,
      nowIso(),
      employerId,
    )
}

export function updateFreelancerProfileState(
  freelancerId: string,
  state: {
    trustScore: number
    metrics: TrustMetrics
    walletBalance: number
    totalEarnings: number
    completedProjects: number
    averageReview: number
    averageResponseHours: number
    trustHistory: TrustTimelinePoint[]
    earningsHistory: { period: string; amount: number }[]
  },
) {
  getDatabase()
    .prepare(
      `
        UPDATE users
        SET trust_score = ?,
            wallet_balance = ?,
            total_earnings = ?,
            completed_projects = ?,
            average_review = ?,
            average_response_hours = ?,
            completion_rate = ?,
            peer_review_avg = ?,
            forum_activity = ?,
            response_time_min = ?,
            report_count = ?,
            trust_history_json = ?,
            earnings_history_json = ?,
            updated_at = ?
        WHERE id = ?
      `,
    )
    .run(
      state.trustScore,
      state.walletBalance,
      state.totalEarnings,
      state.completedProjects,
      state.averageReview,
      state.averageResponseHours,
      state.metrics.completionRate,
      state.metrics.peerReviewAvg,
      state.metrics.forumActivity,
      state.metrics.responseTimeMin,
      state.metrics.reportCount,
      JSON.stringify(state.trustHistory),
      JSON.stringify(state.earningsHistory),
      nowIso(),
      freelancerId,
    )
}
