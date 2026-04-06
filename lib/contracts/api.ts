import { z } from "zod"
import {
  JOB_CATEGORIES,
  RATE_TYPES,
  WORK_MODES,
} from "@/lib/types"

export interface ApiErrorPayload {
  code: string
  message: string
  fieldErrors?: Record<string, string[]>
}

export interface ApiSuccessPayload<T> {
  success: true
  data: T
}

export interface ApiFailurePayload {
  success: false
  error: ApiErrorPayload
}

export const ScamCheckRequestSchema = z.object({
  content: z.string().trim().min(8, "Provide more context to assess risk.").max(4000),
})

export const TrustMetricsSchema = z.object({
  completionRate: z.number().min(0).max(1),
  peerReviewAvg: z.number().min(0).max(5),
  forumActivity: z.number().int().min(0).max(500),
  responseTimeMin: z.number().min(0).max(10080),
  reportCount: z.number().int().min(0).max(50),
})

export const EscrowRequestSchema = z.object({
  amount: z.number().positive().max(500_000),
  balance: z.number().min(0).max(1_000_000),
})

export const RecommendationQuerySchema = z.object({
  userId: z.string().trim().min(1).max(64).default("freelancer-001"),
})

export const ActivityLogSchema = z.object({
  userId: z.string().trim().min(1).max(64),
  action: z.enum(["JOB_POST", "LOGIN", "MESSAGE"]),
  timestamp: z.number().int().positive(),
})

export const AnomalyRequestSchema = z.object({
  logs: z.array(ActivityLogSchema).max(250).default([]),
})

export const DemoLoginSchema = z.object({
  userId: z.string().trim().min(1).max(64),
  demoCode: z.string().trim().min(4).max(32),
})

export const JobCreateSchema = z.object({
  title: z.string().trim().min(8).max(120),
  category: z.enum(JOB_CATEGORIES),
  tags: z.array(z.string().trim().min(2).max(40)).min(1).max(8),
  location: z.string().trim().min(2).max(80),
  workMode: z.enum(WORK_MODES),
  rateType: z.enum(RATE_TYPES),
  budgetMin: z.number().positive().max(1_000_000),
  budgetMax: z.number().positive().max(1_000_000),
  currency: z.string().trim().min(3).max(8).default("ZMW"),
  description: z.string().trim().min(24).max(3000),
  shiftHours: z.number().positive().max(24).nullable().default(null),
  requiresTransport: z.boolean().default(false),
  requiresEquipment: z.boolean().default(false),
  certifications: z.array(z.string().trim().min(2).max(60)).max(8).default([]),
  tools: z.array(z.string().trim().min(2).max(60)).max(8).default([]),
  experienceLevel: z.enum(["entry", "mid", "senior"]).default("mid"),
}).refine((value) => value.budgetMax >= value.budgetMin, {
  message: "Maximum budget must be greater than or equal to minimum budget.",
  path: ["budgetMax"],
})

export const ApplicationCreateSchema = z.object({
  jobId: z.string().trim().min(1).max(64),
  coverLetter: z.string().trim().min(20).max(2000),
  proposedRate: z.number().positive().max(1_000_000),
  estimatedDays: z.number().int().positive().max(365),
})

export const HireCreateSchema = z.object({
  applicationId: z.string().trim().min(1).max(64),
  agreedAmount: z.number().positive().max(1_000_000),
  scopeSummary: z.string().trim().min(16).max(1000),
})

export const EscrowFundSchema = z.object({
  hireId: z.string().trim().min(1).max(64),
})

export const HireSubmitSchema = z.object({
  hireId: z.string().trim().min(1).max(64),
  completionSummary: z.string().trim().min(16).max(2000),
})

export const DisputeCreateSchema = z.object({
  hireId: z.string().trim().min(1).max(64),
  reason: z.string().trim().min(16).max(2000),
})

export const DisputeResolveSchema = z.object({
  disputeId: z.string().trim().min(1).max(64),
  action: z.enum(["release", "refund"]),
  resolution: z.string().trim().min(12).max(2000),
})

export const ReviewCreateSchema = z.object({
  hireId: z.string().trim().min(1).max(64),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(12).max(1000),
})
