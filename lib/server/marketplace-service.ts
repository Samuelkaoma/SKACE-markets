import { format } from "date-fns"

import { rankJobsForUser } from "@/lib/ai/recommendationEngine"
import { calculateTrustScore } from "@/lib/ai/trustScore"
import { simulateEscrowLock } from "@/lib/finance/escrowEngine"
import { inTransaction } from "@/lib/server/database"
import {
  addActivityLog,
  addTrustEvent,
  createApplication,
  createDispute,
  createEscrow,
  createHire,
  createJob,
  createReview,
  getApplicationById,
  getEmployerById,
  getEscrowByHireId,
  getFreelancerById,
  getHireById,
  getJobById,
  listDisputes,
  listReviewsForUser,
  updateApplicationStatus,
  updateEmployerSignals,
  updateEscrowStatus,
  updateFreelancerProfileState,
  updateHireStatus,
  updateJobStatus,
  updateUserWalletBalance,
  type NewApplicationInput,
  type NewDisputeInput,
  type NewHireInput,
  type NewJobInput,
  type NewReviewInput,
} from "@/lib/server/marketplace-repository"
import type { EarningsPoint, TrustMetrics, TrustTimelinePoint } from "@/lib/types"

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

function currentMonthLabel() {
  return format(new Date(), "MMM")
}

function bumpTrustHistory(history: TrustTimelinePoint[], score: number) {
  const month = currentMonthLabel()
  const existing = history.find((point) => point.period === month)

  if (existing) {
    return history.map((point) => (point.period === month ? { ...point, score } : point))
  }

  return [...history.slice(-5), { period: month, score }]
}

function bumpEarningsHistory(history: EarningsPoint[], amount: number) {
  const month = currentMonthLabel()
  const existing = history.find((point) => point.period === month)

  if (existing) {
    return history.map((point) =>
      point.period === month ? { ...point, amount: point.amount + amount } : point,
    )
  }

  return [...history.slice(-5), { period: month, amount }]
}

function incrementWeeklyApplications(weeklyApplications: number[]) {
  if (weeklyApplications.length === 0) {
    return [1]
  }

  return weeklyApplications.map((count, index) =>
    index === weeklyApplications.length - 1 ? count + 1 : count,
  )
}

function applyFreelancerDelta(
  freelancerId: string,
  delta: {
    walletDelta?: number
    earningsDelta?: number
    completedProject?: boolean
    reviewRating?: number
    forumActivityDelta?: number
    reportDelta?: number
    manualTrustDelta?: number
  },
) {
  const freelancer = getFreelancerById(freelancerId)

  if (!freelancer) {
    throw new Error("Freelancer profile was not found.")
  }

  const completedProjects = freelancer.completedProjects + (delta.completedProject ? 1 : 0)
  const historicalCompleted = Math.max(freelancer.completedProjects, 1)
  const completedEstimate = freelancer.metrics.completionRate * historicalCompleted

  const metrics: TrustMetrics = {
    completionRate: clamp(
      (completedEstimate + (delta.completedProject ? 1 : 0)) /
        Math.max(completedProjects, 1),
      0,
      1,
    ),
    peerReviewAvg:
      delta.reviewRating !== undefined
        ? clamp(
            (freelancer.averageReview * historicalCompleted + delta.reviewRating) /
              Math.max(historicalCompleted + 1, 1),
            0,
            5,
          )
        : freelancer.metrics.peerReviewAvg,
    forumActivity: clamp(
      freelancer.metrics.forumActivity + (delta.forumActivityDelta ?? 0),
      0,
      500,
    ),
    responseTimeMin: freelancer.metrics.responseTimeMin,
    reportCount: Math.max(freelancer.metrics.reportCount + (delta.reportDelta ?? 0), 0),
  }

  const averageReview =
    delta.reviewRating !== undefined
      ? clamp(
          (freelancer.averageReview * historicalCompleted + delta.reviewRating) /
            Math.max(historicalCompleted + 1, 1),
          0,
          5,
        )
      : freelancer.averageReview

  const trustScore = clamp(
    calculateTrustScore(metrics) + (delta.manualTrustDelta ?? 0),
    0,
    100,
  )

  updateFreelancerProfileState(freelancerId, {
    trustScore: Math.round(trustScore),
    metrics,
    walletBalance: freelancer.walletBalance + (delta.walletDelta ?? 0),
    totalEarnings: freelancer.totalEarnings + (delta.earningsDelta ?? 0),
    completedProjects,
    averageReview,
    averageResponseHours: freelancer.averageResponseHours,
    trustHistory: bumpTrustHistory(freelancer.trustHistory, Math.round(trustScore)),
    earningsHistory:
      delta.earningsDelta && delta.earningsDelta > 0
        ? bumpEarningsHistory(freelancer.earningsHistory, delta.earningsDelta)
        : freelancer.earningsHistory,
  })
}

export function createMarketplaceJob(input: NewJobInput) {
  return inTransaction(() => {
    const job = createJob(input)

    if (!job) {
      throw new Error("Job could not be created.")
    }

    addActivityLog(
      input.employerId,
      "Posted a new role",
      `${job.title} is now live on the marketplace`,
      "HIRING",
    )

    return job
  })
}

export function applyToMarketplaceJob(
  input: Omit<NewApplicationInput, "employerId" | "fitScore" | "rateType">,
) {
  return inTransaction(() => {
    const freelancer = getFreelancerById(input.freelancerId)
    const job = getJobById(input.jobId)

    if (!freelancer || !job) {
      throw new Error("The freelancer or job could not be found.")
    }

    if (job.status !== "open") {
      throw new Error("Only open jobs can receive new applications.")
    }

    const fitScore =
      rankJobsForUser(freelancer.skills, freelancer.location, [job], freelancer.trustScore)[0]
        ?.matchScore ?? 70

    const application = createApplication({
      jobId: job.id,
      employerId: job.employerId,
      freelancerId: freelancer.id,
      coverLetter: input.coverLetter,
      proposedRate: input.proposedRate,
      rateType: job.rateType,
      estimatedDays: input.estimatedDays,
      fitScore,
    })

    const employer = getEmployerById(job.employerId)

    if (employer) {
      updateEmployerSignals(employer.id, {
        weeklyApplications: incrementWeeklyApplications(employer.weeklyApplications),
      })
      addActivityLog(
        employer.id,
        "Received a new application",
        `${freelancer.name} applied to ${job.title}`,
        "HIRING",
      )
    }

    addActivityLog(
      freelancer.id,
      "Applied to a role",
      `Submitted a proposal for ${job.title}`,
      "APPLICATION",
    )

    addTrustEvent(freelancer.id, "APPLICATION_SUBMITTED", 1, `Applied to ${job.title}`)
    applyFreelancerDelta(freelancer.id, {
      forumActivityDelta: 1,
      manualTrustDelta: 1,
    })

    return application
  })
}

export function hireMarketplaceApplication(input: {
  applicationId: string
  employerId: string
  agreedAmount: number
  scopeSummary: string
}) {
  return inTransaction(() => {
    const application = getApplicationById(input.applicationId)

    if (!application) {
      throw new Error("Application was not found.")
    }

    if (application.employerId !== input.employerId) {
      throw new Error("Only the owning employer can hire from this application.")
    }

    const job = getJobById(application.jobId)
    const employer = getEmployerById(input.employerId)

    if (!job || !employer) {
      throw new Error("The job or employer record could not be found.")
    }

    const hire = createHire({
      jobId: application.jobId,
      applicationId: application.id,
      employerId: input.employerId,
      freelancerId: application.freelancerId,
      amount: input.agreedAmount,
      currency: job.currency,
      scopeSummary: input.scopeSummary,
    } satisfies NewHireInput)

    updateApplicationStatus(application.id, "hired")
    updateJobStatus(job.id, "in_progress")
    updateEmployerSignals(employer.id, {
      hiresThisQuarter: employer.hiresThisQuarter + 1,
    })

    addActivityLog(
      employer.id,
      "Created a hire",
      `Moved ${application.freelancerName} into an active hire for ${job.title}`,
      "HIRING",
    )
    addActivityLog(
      application.freelancerId,
      "Won a job",
      `Accepted for ${job.title}`,
      "HIRING",
    )

    addTrustEvent(application.freelancerId, "HIRED", 2, `Hired for ${job.title}`)
    applyFreelancerDelta(application.freelancerId, {
      forumActivityDelta: 1,
      manualTrustDelta: 2,
    })

    return hire
  })
}

export function fundHireEscrow(input: { hireId: string; employerId: string }) {
  return inTransaction(() => {
    const hire = getHireById(input.hireId)

    if (!hire) {
      throw new Error("Hire record was not found.")
    }

    if (hire.employerId !== input.employerId) {
      throw new Error("Only the hiring employer can fund this escrow.")
    }

    if (getEscrowByHireId(hire.id)) {
      throw new Error("Escrow is already funded for this hire.")
    }

    const employer = getEmployerById(input.employerId)

    if (!employer) {
      throw new Error("Employer profile was not found.")
    }

    const escrowLock = simulateEscrowLock(hire.amount, employer.walletBalance)

    updateUserWalletBalance(employer.id, escrowLock.newBalance)

    const escrow = createEscrow({
      hireId: hire.id,
      jobId: hire.jobId,
      employerId: hire.employerId,
      freelancerId: hire.freelancerId,
      amount: hire.amount,
      currency: hire.currency,
      holdReference: escrowLock.holdReference,
      releaseEta: escrowLock.releaseEta,
      message: escrowLock.message,
    })

    addActivityLog(
      employer.id,
      "Funded escrow",
      `${escrow?.holdReference ?? "Escrow"} is now protecting ${hire.jobTitle}`,
      "ESCROW",
    )
    addActivityLog(
      hire.freelancerId,
      "Escrow funded",
      `Protected funds are now locked for ${hire.jobTitle}`,
      "ESCROW",
    )

    return escrow
  })
}

export function submitHireWork(input: {
  hireId: string
  freelancerId: string
  completionSummary: string
}) {
  return inTransaction(() => {
    const hire = getHireById(input.hireId)

    if (!hire) {
      throw new Error("Hire record was not found.")
    }

    if (hire.freelancerId !== input.freelancerId) {
      throw new Error("Only the assigned freelancer can submit this work.")
    }

    if (hire.status !== "active") {
      throw new Error("Only active hires can be submitted for approval.")
    }

    const updated = updateHireStatus(hire.id, "submitted", input.completionSummary)

    addActivityLog(
      hire.freelancerId,
      "Submitted work",
      `Sent completion proof for ${hire.jobTitle}`,
      "DELIVERY",
    )
    addActivityLog(
      hire.employerId,
      "Work submitted for review",
      `${hire.freelancerName} submitted work for ${hire.jobTitle}`,
      "DELIVERY",
    )

    return updated
  })
}

export function releaseHireEscrow(input: { hireId: string; actorId: string }) {
  return inTransaction(() => {
    const hire = getHireById(input.hireId)
    const escrow = getEscrowByHireId(input.hireId)

    if (!hire || !escrow) {
      throw new Error("The hire or escrow record was not found.")
    }

    if (hire.employerId !== input.actorId && input.actorId !== "admin-001") {
      throw new Error("Only the employer or an admin can release this escrow.")
    }

    if (escrow.status !== "LOCKED" && escrow.status !== "DISPUTED") {
      throw new Error("Only protected escrows can be released.")
    }

    updateEscrowStatus(hire.id, "RELEASED")
    updateHireStatus(hire.id, "completed")
    applyFreelancerDelta(hire.freelancerId, {
      walletDelta: escrow.amount,
      earningsDelta: escrow.amount,
      completedProject: true,
      forumActivityDelta: 2,
      manualTrustDelta: 4,
    })

    addActivityLog(
      hire.freelancerId,
      "Escrow released",
      `${escrow.amount.toLocaleString()} ${escrow.currency} settled for ${hire.jobTitle}`,
      "ESCROW",
    )
    addActivityLog(
      hire.employerId,
      "Released protected funds",
      `Completed payout for ${hire.jobTitle}`,
      "ESCROW",
    )

    addTrustEvent(hire.freelancerId, "ESCROW_RELEASED", 4, `Escrow released for ${hire.jobTitle}`)
    return getEscrowByHireId(hire.id)
  })
}

export function openHireDispute(input: { hireId: string; openedByUserId: string; reason: string }) {
  return inTransaction(() => {
    const hire = getHireById(input.hireId)
    const escrow = getEscrowByHireId(input.hireId)

    if (!hire || !escrow) {
      throw new Error("The hire or escrow record was not found.")
    }

    if (hire.employerId !== input.openedByUserId && hire.freelancerId !== input.openedByUserId) {
      throw new Error("Only participants in the hire can open a dispute.")
    }

    if (escrow.status === "DISPUTED") {
      throw new Error("This escrow already has an active dispute.")
    }

    updateEscrowStatus(hire.id, "DISPUTED", input.reason)

    const dispute = createDispute({
      escrowId: escrow.id,
      hireId: hire.id,
      openedByUserId: input.openedByUserId,
      reason: input.reason,
    } satisfies NewDisputeInput)

    addActivityLog(
      hire.employerId,
      "Escrow dispute opened",
      `Dispute raised on ${hire.jobTitle}`,
      "DISPUTE",
    )
    addActivityLog(
      hire.freelancerId,
      "Escrow dispute opened",
      `Dispute raised on ${hire.jobTitle}`,
      "DISPUTE",
    )

    if (input.openedByUserId === hire.employerId) {
      addTrustEvent(hire.freelancerId, "DISPUTE_OPENED", -4, `Dispute raised on ${hire.jobTitle}`)
      applyFreelancerDelta(hire.freelancerId, {
        reportDelta: 1,
        manualTrustDelta: -4,
      })
    }

    return dispute
  })
}

export function resolveMarketplaceDispute(input: {
  disputeId: string
  adminId: string
  action: "release" | "refund"
  resolution: string
}) {
  return inTransaction(() => {
    if (input.adminId !== "admin-001") {
      throw new Error("Only admin users can resolve disputes.")
    }

    const dispute = listDisputes().find((item) => item.id === input.disputeId)

    if (!dispute) {
      throw new Error("Dispute was not found.")
    }

    const hire = getHireById(dispute.hireId)
    const escrow = getEscrowByHireId(dispute.hireId)

    if (!hire || !escrow) {
      throw new Error("The linked hire or escrow record was not found.")
    }

    if (input.action === "release") {
      updateEscrowStatus(hire.id, "RELEASED")
      updateHireStatus(hire.id, "completed", hire.completionSummary)
      applyFreelancerDelta(hire.freelancerId, {
        walletDelta: escrow.amount,
        earningsDelta: escrow.amount,
        completedProject: true,
        manualTrustDelta: 2,
      })
      addTrustEvent(hire.freelancerId, "DISPUTE_RESOLVED", 2, input.resolution)
    } else {
      const employer = getEmployerById(hire.employerId)

      if (employer) {
        updateUserWalletBalance(employer.id, employer.walletBalance + escrow.amount)
      }

      updateEscrowStatus(hire.id, "RELEASED")
      updateHireStatus(hire.id, "cancelled", input.resolution)
      updateJobStatus(hire.jobId, "open")
      applyFreelancerDelta(hire.freelancerId, {
        reportDelta: 1,
        manualTrustDelta: -3,
      })
      addTrustEvent(hire.freelancerId, "DISPUTE_REFUND", -3, input.resolution)
    }

    return listDisputes().find((item) => item.id === input.disputeId) ?? null
  })
}

export function submitMarketplaceReview(input: {
  hireId: string
  authorUserId: string
  rating: number
  comment: string
}) {
  return inTransaction(() => {
    const hire = getHireById(input.hireId)

    if (!hire) {
      throw new Error("Hire record was not found.")
    }

    if (hire.status !== "completed") {
      throw new Error("Reviews can only be left after a completed hire.")
    }

    const subjectUserId =
      input.authorUserId === hire.employerId ? hire.freelancerId : hire.employerId

    if (listReviewsForUser(subjectUserId).some((review) => review.hireId === hire.id)) {
      throw new Error("A review has already been submitted for this hire.")
    }

    const review = createReview({
      hireId: hire.id,
      jobId: hire.jobId,
      authorUserId: input.authorUserId,
      subjectUserId,
      rating: input.rating,
      comment: input.comment,
    } satisfies NewReviewInput)

    if (subjectUserId === hire.freelancerId) {
      addTrustEvent(
        hire.freelancerId,
        "REVIEW_RECEIVED",
        input.rating >= 4 ? 3 : -2,
        `Received a ${input.rating}-star review for ${hire.jobTitle}`,
      )
      applyFreelancerDelta(hire.freelancerId, {
        reviewRating: input.rating,
        manualTrustDelta: input.rating >= 4 ? 2 : -2,
      })
    }

    return review
  })
}
