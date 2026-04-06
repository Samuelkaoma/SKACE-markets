import { randomUUID } from "node:crypto"
import { mkdirSync } from "node:fs"
import { join } from "node:path"
import { cwd } from "node:process"
import { DatabaseSync, type SQLInputValue } from "node:sqlite"

import { adminSeeds, employerProfiles, freelancerSeeds } from "@/lib/data/demo-users"
import {
  activityLogSeeds,
  applicationSeeds,
  disputeSeeds,
  escrowSeeds,
  fraudFlags,
  hireSeeds,
  jobPostings,
  reviewSeeds,
  trustEventSeeds,
} from "@/lib/data/demo-workflows"

const DATABASE_DIRECTORY = join(cwd(), "data")
const DATABASE_PATH = join(DATABASE_DIRECTORY, "skace-marketplace.sqlite")
const SEED_TIMESTAMP = "2026-04-06T08:30:00.000Z"

type DatabaseGlobal = typeof globalThis & {
  __skaceDatabase?: DatabaseSync
  __skaceDatabaseInitialized?: boolean
}

function toJson(value: unknown) {
  return JSON.stringify(value)
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function createDatabase() {
  mkdirSync(DATABASE_DIRECTORY, { recursive: true })
  return new DatabaseSync(DATABASE_PATH, {
    timeout: 5000,
    enableForeignKeyConstraints: true,
  })
}

function initializeSchema(database: DatabaseSync) {
  database.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      demo_code TEXT NOT NULL,
      name TEXT NOT NULL,
      company TEXT,
      contact_name TEXT,
      headline TEXT,
      bio TEXT,
      industry TEXT,
      location TEXT NOT NULL,
      currency TEXT NOT NULL,
      trust_score INTEGER NOT NULL DEFAULT 0,
      wallet_balance REAL NOT NULL DEFAULT 0,
      availability TEXT,
      hourly_rate REAL,
      monthly_hiring_budget REAL,
      hires_this_quarter INTEGER NOT NULL DEFAULT 0,
      dispute_rate REAL NOT NULL DEFAULT 0,
      total_earnings REAL NOT NULL DEFAULT 0,
      completed_projects INTEGER NOT NULL DEFAULT 0,
      average_review REAL NOT NULL DEFAULT 0,
      average_response_hours REAL NOT NULL DEFAULT 0,
      completion_rate REAL NOT NULL DEFAULT 0,
      peer_review_avg REAL NOT NULL DEFAULT 0,
      forum_activity INTEGER NOT NULL DEFAULT 0,
      response_time_min INTEGER NOT NULL DEFAULT 0,
      report_count INTEGER NOT NULL DEFAULT 0,
      identity_verification TEXT,
      skills_verification TEXT,
      payments_verification TEXT,
      business_verification TEXT,
      compliance_verification TEXT,
      skills_json TEXT NOT NULL DEFAULT '[]',
      specialties_json TEXT NOT NULL DEFAULT '[]',
      certifications_json TEXT NOT NULL DEFAULT '[]',
      tools_json TEXT NOT NULL DEFAULT '[]',
      job_categories_json TEXT NOT NULL DEFAULT '[]',
      preferred_work_modes_json TEXT NOT NULL DEFAULT '[]',
      trust_history_json TEXT NOT NULL DEFAULT '[]',
      earnings_history_json TEXT NOT NULL DEFAULT '[]',
      achievements_json TEXT NOT NULL DEFAULT '[]',
      weekly_applications_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      employer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      category TEXT NOT NULL,
      tags_json TEXT NOT NULL DEFAULT '[]',
      location TEXT NOT NULL,
      work_mode TEXT NOT NULL,
      remote INTEGER NOT NULL DEFAULT 0,
      rate_type TEXT NOT NULL,
      status TEXT NOT NULL,
      budget_min REAL NOT NULL,
      budget_max REAL NOT NULL,
      currency TEXT NOT NULL,
      description TEXT NOT NULL,
      posted_at TEXT NOT NULL,
      views INTEGER NOT NULL DEFAULT 0,
      applications INTEGER NOT NULL DEFAULT 0,
      interviews INTEGER NOT NULL DEFAULT 0,
      hires INTEGER NOT NULL DEFAULT 0,
      shift_hours REAL,
      requires_transport INTEGER NOT NULL DEFAULT 0,
      requires_equipment INTEGER NOT NULL DEFAULT 0,
      certifications_json TEXT NOT NULL DEFAULT '[]',
      tools_json TEXT NOT NULL DEFAULT '[]',
      experience_level TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      employer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      freelancer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      cover_letter TEXT NOT NULL,
      proposed_rate REAL NOT NULL,
      rate_type TEXT NOT NULL,
      estimated_days INTEGER NOT NULL,
      fit_score INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(job_id, freelancer_id)
    );

    CREATE TABLE IF NOT EXISTS hires (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      application_id TEXT NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
      employer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      freelancer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      scope_summary TEXT NOT NULL,
      completion_summary TEXT,
      start_date TEXT NOT NULL,
      submitted_at TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS escrows (
      id TEXT PRIMARY KEY,
      hire_id TEXT NOT NULL UNIQUE REFERENCES hires(id) ON DELETE CASCADE,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      employer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      freelancer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      status TEXT NOT NULL,
      hold_reference TEXT NOT NULL UNIQUE,
      release_eta TEXT NOT NULL,
      message TEXT NOT NULL,
      dispute_reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      released_at TEXT
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      hire_id TEXT NOT NULL REFERENCES hires(id) ON DELETE CASCADE,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      author_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subject_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS disputes (
      id TEXT PRIMARY KEY,
      escrow_id TEXT NOT NULL REFERENCES escrows(id) ON DELETE CASCADE,
      hire_id TEXT NOT NULL REFERENCES hires(id) ON DELETE CASCADE,
      opened_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reason TEXT NOT NULL,
      status TEXT NOT NULL,
      resolution TEXT,
      created_at TEXT NOT NULL,
      resolved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS fraud_flags (
      id TEXT PRIMARY KEY,
      account TEXT NOT NULL,
      account_id TEXT NOT NULL,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      confidence REAL NOT NULL,
      detected_at TEXT NOT NULL,
      reason TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trust_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      effect REAL NOT NULL,
      note TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      title TEXT NOT NULL,
      detail TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
    CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
    CREATE INDEX IF NOT EXISTS idx_applications_freelancer_id ON applications(freelancer_id);
    CREATE INDEX IF NOT EXISTS idx_hires_employer_id ON hires(employer_id);
    CREATE INDEX IF NOT EXISTS idx_hires_freelancer_id ON hires(freelancer_id);
    CREATE INDEX IF NOT EXISTS idx_escrows_hire_id ON escrows(hire_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_subject_user_id ON reviews(subject_user_id);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  `)
}

function seedUsers(database: DatabaseSync) {
  const insert = database.prepare(`
    INSERT INTO users (
      id, role, email, demo_code, name, company, contact_name, headline, bio, industry,
      location, currency, trust_score, wallet_balance, availability, hourly_rate,
      monthly_hiring_budget, hires_this_quarter, dispute_rate, total_earnings,
      completed_projects, average_review, average_response_hours, completion_rate,
      peer_review_avg, forum_activity, response_time_min, report_count,
      identity_verification, skills_verification, payments_verification,
      business_verification, compliance_verification, skills_json, specialties_json,
      certifications_json, tools_json, job_categories_json, preferred_work_modes_json,
      trust_history_json, earnings_history_json, achievements_json, weekly_applications_json,
      created_at, updated_at
    ) VALUES (
      :id, :role, :email, :demoCode, :name, :company, :contactName, :headline, :bio, :industry,
      :location, :currency, :trustScore, :walletBalance, :availability, :hourlyRate,
      :monthlyHiringBudget, :hiresThisQuarter, :disputeRate, :totalEarnings,
      :completedProjects, :averageReview, :averageResponseHours, :completionRate,
      :peerReviewAvg, :forumActivity, :responseTimeMin, :reportCount,
      :identityVerification, :skillsVerification, :paymentsVerification,
      :businessVerification, :complianceVerification, :skillsJson, :specialtiesJson,
      :certificationsJson, :toolsJson, :jobCategoriesJson, :preferredWorkModesJson,
      :trustHistoryJson, :earningsHistoryJson, :achievementsJson, :weeklyApplicationsJson,
      :createdAt, :updatedAt
    )
  `)

  for (const freelancer of freelancerSeeds) {
    insert.run({
      id: freelancer.id,
      role: freelancer.role,
      email: freelancer.email,
      demoCode: freelancer.demoCode,
      name: freelancer.name,
      company: null,
      contactName: null,
      headline: freelancer.headline,
      bio: freelancer.bio,
      industry: null,
      location: freelancer.location,
      currency: freelancer.currency,
      trustScore: freelancer.trustScore,
      walletBalance: freelancer.walletBalance,
      availability: freelancer.availability,
      hourlyRate: freelancer.hourlyRate,
      monthlyHiringBudget: null,
      hiresThisQuarter: 0,
      disputeRate: 0,
      totalEarnings: freelancer.totalEarnings,
      completedProjects: freelancer.completedProjects,
      averageReview: freelancer.averageReview,
      averageResponseHours: freelancer.averageResponseHours,
      completionRate: freelancer.metrics.completionRate,
      peerReviewAvg: freelancer.metrics.peerReviewAvg,
      forumActivity: freelancer.metrics.forumActivity,
      responseTimeMin: freelancer.metrics.responseTimeMin,
      reportCount: freelancer.metrics.reportCount,
      identityVerification: freelancer.verification.identity,
      skillsVerification: freelancer.verification.skills,
      paymentsVerification: freelancer.verification.payments,
      businessVerification: null,
      complianceVerification: null,
      skillsJson: toJson(freelancer.skills),
      specialtiesJson: toJson(freelancer.specialties),
      certificationsJson: toJson(freelancer.certifications),
      toolsJson: toJson(freelancer.tools),
      jobCategoriesJson: toJson(freelancer.jobCategories),
      preferredWorkModesJson: toJson(freelancer.preferredWorkModes),
      trustHistoryJson: toJson(freelancer.trustHistory),
      earningsHistoryJson: toJson(freelancer.earningsHistory),
      achievementsJson: toJson(freelancer.achievements),
      weeklyApplicationsJson: toJson([]),
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    })
  }

  for (const employer of employerProfiles) {
    insert.run({
      id: employer.id,
      role: employer.role,
      email: employer.email,
      demoCode: employer.demoCode,
      name: employer.name,
      company: employer.company,
      contactName: employer.contactName,
      headline: null,
      bio: null,
      industry: employer.industry,
      location: employer.location,
      currency: employer.currency,
      trustScore: employer.trustScore,
      walletBalance: employer.walletBalance,
      availability: null,
      hourlyRate: null,
      monthlyHiringBudget: employer.monthlyHiringBudget,
      hiresThisQuarter: employer.hiresThisQuarter,
      disputeRate: employer.disputeRate,
      totalEarnings: 0,
      completedProjects: 0,
      averageReview: 0,
      averageResponseHours: 0,
      completionRate: 0,
      peerReviewAvg: 0,
      forumActivity: 0,
      responseTimeMin: 0,
      reportCount: 0,
      identityVerification: null,
      skillsVerification: null,
      paymentsVerification: employer.verification.payments,
      businessVerification: employer.verification.business,
      complianceVerification: employer.verification.compliance,
      skillsJson: toJson([]),
      specialtiesJson: toJson([]),
      certificationsJson: toJson([]),
      toolsJson: toJson([]),
      jobCategoriesJson: toJson([]),
      preferredWorkModesJson: toJson([]),
      trustHistoryJson: toJson([]),
      earningsHistoryJson: toJson([]),
      achievementsJson: toJson([]),
      weeklyApplicationsJson: toJson(employer.weeklyApplications),
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    })
  }

  for (const admin of adminSeeds) {
    insert.run({
      id: admin.id,
      role: admin.role,
      email: admin.email,
      demoCode: admin.demoCode,
      name: admin.name,
      company: "SKACE Markets",
      contactName: admin.name,
      headline: admin.headline,
      bio: admin.headline,
      industry: "Platform Operations",
      location: admin.location,
      currency: admin.currency,
      trustScore: admin.trustScore,
      walletBalance: admin.walletBalance,
      availability: null,
      hourlyRate: null,
      monthlyHiringBudget: null,
      hiresThisQuarter: 0,
      disputeRate: 0,
      totalEarnings: 0,
      completedProjects: 0,
      averageReview: 0,
      averageResponseHours: 0,
      completionRate: 0,
      peerReviewAvg: 0,
      forumActivity: 0,
      responseTimeMin: 0,
      reportCount: 0,
      identityVerification: "verified",
      skillsVerification: "verified",
      paymentsVerification: "verified",
      businessVerification: "verified",
      complianceVerification: "verified",
      skillsJson: toJson([]),
      specialtiesJson: toJson([]),
      certificationsJson: toJson([]),
      toolsJson: toJson([]),
      jobCategoriesJson: toJson([]),
      preferredWorkModesJson: toJson([]),
      trustHistoryJson: toJson([]),
      earningsHistoryJson: toJson([]),
      achievementsJson: toJson([]),
      weeklyApplicationsJson: toJson([]),
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    })
  }
}

function seedJobs(database: DatabaseSync) {
  const insert = database.prepare(`
    INSERT INTO jobs (
      id, employer_id, title, company, category, tags_json, location, work_mode, remote,
      rate_type, status, budget_min, budget_max, currency, description, posted_at, views,
      applications, interviews, hires, shift_hours, requires_transport, requires_equipment,
      certifications_json, tools_json, experience_level, created_at, updated_at
    ) VALUES (
      :id, :employerId, :title, :company, :category, :tagsJson, :location, :workMode, :remote,
      :rateType, :status, :budgetMin, :budgetMax, :currency, :description, :postedAt, :views,
      :applications, :interviews, :hires, :shiftHours, :requiresTransport, :requiresEquipment,
      :certificationsJson, :toolsJson, :experienceLevel, :createdAt, :updatedAt
    )
  `)

  for (const job of jobPostings) {
    insert.run({
      id: job.id,
      employerId: job.employerId,
      title: job.title,
      company: job.company,
      category: job.category,
      tagsJson: toJson(job.tags),
      location: job.location,
      workMode: job.workMode,
      remote: job.remote ? 1 : 0,
      rateType: job.rateType,
      status: job.status,
      budgetMin: job.budgetMin,
      budgetMax: job.budgetMax,
      currency: job.currency,
      description: job.description,
      postedAt: job.postedAt,
      views: job.views,
      applications: job.applications,
      interviews: job.interviews,
      hires: job.hires,
      shiftHours: job.shiftHours,
      requiresTransport: job.requiresTransport ? 1 : 0,
      requiresEquipment: job.requiresEquipment ? 1 : 0,
      certificationsJson: toJson(job.certifications),
      toolsJson: toJson(job.tools),
      experienceLevel: job.experienceLevel,
      createdAt: job.postedAt,
      updatedAt: job.postedAt,
    })
  }
}

function seedApplications(database: DatabaseSync) {
  const insert = database.prepare(`
    INSERT INTO applications (
      id, job_id, employer_id, freelancer_id, status, cover_letter, proposed_rate,
      rate_type, estimated_days, fit_score, created_at, updated_at
    ) VALUES (
      :id, :jobId, :employerId, :freelancerId, :status, :coverLetter, :proposedRate,
      :rateType, :estimatedDays, :fitScore, :createdAt, :updatedAt
    )
  `)

  for (const application of applicationSeeds) {
    insert.run({
      id: application.id,
      jobId: application.jobId,
      employerId: application.employerId,
      freelancerId: application.freelancerId,
      status: application.status,
      coverLetter: application.coverLetter,
      proposedRate: application.proposedRate,
      rateType: application.rateType,
      estimatedDays: application.estimatedDays,
      fitScore: application.fitScore,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    })
  }
}

function seedHires(database: DatabaseSync) {
  const insert = database.prepare(`
    INSERT INTO hires (
      id, job_id, application_id, employer_id, freelancer_id, status, amount, currency,
      scope_summary, completion_summary, start_date, submitted_at, completed_at,
      created_at, updated_at
    ) VALUES (
      :id, :jobId, :applicationId, :employerId, :freelancerId, :status, :amount, :currency,
      :scopeSummary, :completionSummary, :startDate, :submittedAt, :completedAt,
      :createdAt, :updatedAt
    )
  `)

  for (const hire of hireSeeds) {
    insert.run({
      id: hire.id,
      jobId: hire.jobId,
      applicationId: hire.applicationId,
      employerId: hire.employerId,
      freelancerId: hire.freelancerId,
      status: hire.status,
      amount: hire.amount,
      currency: hire.currency,
      scopeSummary: hire.scopeSummary,
      completionSummary: hire.completionSummary,
      startDate: hire.startDate,
      submittedAt: hire.submittedAt,
      completedAt: hire.completedAt,
      createdAt: hire.createdAt,
      updatedAt: hire.updatedAt,
    })
  }
}

function seedEscrows(database: DatabaseSync) {
  const insert = database.prepare(`
    INSERT INTO escrows (
      id, hire_id, job_id, employer_id, freelancer_id, amount, currency, status,
      hold_reference, release_eta, message, dispute_reason, created_at, updated_at, released_at
    ) VALUES (
      :id, :hireId, :jobId, :employerId, :freelancerId, :amount, :currency, :status,
      :holdReference, :releaseEta, :message, :disputeReason, :createdAt, :updatedAt, :releasedAt
    )
  `)

  for (const escrow of escrowSeeds) {
    insert.run({
      id: escrow.id,
      hireId: escrow.hireId,
      jobId: escrow.jobId,
      employerId: escrow.employerId,
      freelancerId: escrow.freelancerId,
      amount: escrow.amount,
      currency: escrow.currency,
      status: escrow.status,
      holdReference: escrow.holdReference,
      releaseEta: escrow.releaseEta,
      message: escrow.message,
      disputeReason: escrow.disputeReason,
      createdAt: escrow.createdAt,
      updatedAt: escrow.updatedAt,
      releasedAt: escrow.releasedAt,
    })
  }
}

function seedReviews(database: DatabaseSync) {
  const insert = database.prepare(`
    INSERT INTO reviews (
      id, hire_id, job_id, author_user_id, subject_user_id, rating, comment, created_at
    ) VALUES (
      :id, :hireId, :jobId, :authorUserId, :subjectUserId, :rating, :comment, :createdAt
    )
  `)

  for (const review of reviewSeeds) {
    insert.run({
      id: review.id,
      hireId: review.hireId,
      jobId: review.jobId,
      authorUserId: review.authorUserId,
      subjectUserId: review.subjectUserId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    })
  }
}

function seedDisputes(database: DatabaseSync) {
  const insert = database.prepare(`
    INSERT INTO disputes (
      id, escrow_id, hire_id, opened_by_user_id, reason, status, resolution, created_at, resolved_at
    ) VALUES (
      :id, :escrowId, :hireId, :openedByUserId, :reason, :status, :resolution, :createdAt, :resolvedAt
    )
  `)

  for (const dispute of disputeSeeds) {
    insert.run({
      id: dispute.id,
      escrowId: dispute.escrowId,
      hireId: dispute.hireId,
      openedByUserId: dispute.openedByUserId,
      reason: dispute.reason,
      status: dispute.status,
      resolution: dispute.resolution,
      createdAt: dispute.createdAt,
      resolvedAt: dispute.resolvedAt,
    })
  }
}

function seedFlags(database: DatabaseSync) {
  const insert = database.prepare(`
    INSERT INTO fraud_flags (
      id, account, account_id, type, severity, confidence, detected_at, reason
    ) VALUES (
      :id, :account, :accountId, :type, :severity, :confidence, :detectedAt, :reason
    )
  `)

  for (const flag of fraudFlags) {
    insert.run({
      id: flag.id,
      account: flag.account,
      accountId: flag.accountId,
      type: flag.type,
      severity: flag.severity,
      confidence: flag.confidence,
      detectedAt: flag.detectedAt,
      reason: flag.reason,
    })
  }
}

function seedTrustEvents(database: DatabaseSync) {
  const insert = database.prepare(`
    INSERT INTO trust_events (id, user_id, type, effect, note, created_at)
    VALUES (:id, :userId, :type, :effect, :note, :createdAt)
  `)

  for (const event of trustEventSeeds) {
    insert.run({
      id: event.id,
      userId: event.userId,
      type: event.type,
      effect: event.effect,
      note: event.note,
      createdAt: event.createdAt,
    })
  }
}

function seedActivityLogs(database: DatabaseSync) {
  const insert = database.prepare(`
    INSERT INTO activity_logs (id, user_id, kind, title, detail, created_at)
    VALUES (:id, :userId, :kind, :title, :detail, :createdAt)
  `)

  for (const log of activityLogSeeds) {
    insert.run({
      id: log.id,
      userId: log.userId,
      kind: log.kind,
      title: log.title,
      detail: log.detail,
      createdAt: log.createdAt,
    })
  }
}

function countUsers(database: DatabaseSync) {
  const row = database.prepare("SELECT COUNT(*) as total FROM users").get() as
    | { total: number }
    | undefined

  return row?.total ?? 0
}

function seedDatabase(database: DatabaseSync) {
  seedUsers(database)
  seedJobs(database)
  seedApplications(database)
  seedHires(database)
  seedEscrows(database)
  seedReviews(database)
  seedDisputes(database)
  seedFlags(database)
  seedTrustEvents(database)
  seedActivityLogs(database)
}

function initializeDatabase(database: DatabaseSync) {
  initializeSchema(database)

  if (countUsers(database) === 0) {
    seedDatabase(database)
  }
}

export function getDatabase() {
  const globalRef = globalThis as DatabaseGlobal

  if (!globalRef.__skaceDatabase) {
    globalRef.__skaceDatabase = createDatabase()
  }

  if (!globalRef.__skaceDatabaseInitialized) {
    initializeDatabase(globalRef.__skaceDatabase)
    globalRef.__skaceDatabaseInitialized = true
  }

  return globalRef.__skaceDatabase
}

export function inTransaction<T>(callback: () => T): T {
  const database = getDatabase()
  database.exec("BEGIN")

  try {
    const result = callback()
    database.exec("COMMIT")
    return result
  } catch (error) {
    database.exec("ROLLBACK")
    throw error
  }
}

export function clearAndReseedDatabase() {
  const database = getDatabase()

  inTransaction(() => {
    database.exec(`
      DELETE FROM sessions;
      DELETE FROM disputes;
      DELETE FROM reviews;
      DELETE FROM escrows;
      DELETE FROM hires;
      DELETE FROM applications;
      DELETE FROM trust_events;
      DELETE FROM activity_logs;
      DELETE FROM fraud_flags;
      DELETE FROM jobs;
      DELETE FROM users;
    `)

    seedDatabase(database)
  })
}

export function createId(prefix: string) {
  return `${prefix}-${randomUUID().slice(0, 8)}`
}

export function nowIso() {
  return new Date().toISOString()
}

export function toSqlBoolean(value: boolean) {
  return value ? 1 : 0
}

export function fromSqlBoolean(value: SQLInputValue) {
  return Number(value ?? 0) === 1
}

export function getDatabasePath() {
  return DATABASE_PATH
}
