import type { RiskLevel, TrustMetrics, TrustScoreBreakdown } from "@/lib/types"

const TRUST_WEIGHTS = {
  completion: 0.4,
  reviews: 0.3,
  community: 0.15,
  responsiveness: 0.15,
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export const calculateTrustScore = (metrics: TrustMetrics): number => {
  const normalizedCompletion = clamp(metrics.completionRate, 0, 1) * 100
  const normalizedReviews = (clamp(metrics.peerReviewAvg, 0, 5) / 5) * 100
  const normalizedForum = clamp((metrics.forumActivity / 20) * 100, 0, 100)
  const normalizedSpeed = clamp(100 - (metrics.responseTimeMin / 1440) * 100, 0, 100)
  const penalties = clamp(metrics.reportCount, 0, 50) * 12

  const weightedScore =
    normalizedCompletion * TRUST_WEIGHTS.completion +
    normalizedReviews * TRUST_WEIGHTS.reviews +
    normalizedForum * TRUST_WEIGHTS.community +
    normalizedSpeed * TRUST_WEIGHTS.responsiveness

  return Math.round(clamp(weightedScore - penalties, 0, 100))
}

export const getTrustBreakdown = (metrics: TrustMetrics): TrustScoreBreakdown => {
  const score = calculateTrustScore(metrics)
  const drivers: string[] = []
  const cautions: string[] = []

  if (metrics.completionRate >= 0.95) drivers.push("Excellent delivery consistency")
  if (metrics.peerReviewAvg >= 4.7) drivers.push("Strong peer feedback")
  if (metrics.forumActivity >= 10) drivers.push("Healthy community contribution")
  if (metrics.responseTimeMin <= 90) drivers.push("Fast communication cadence")

  if (metrics.reportCount > 0) cautions.push("Previous reports are reducing confidence")
  if (metrics.responseTimeMin > 240) cautions.push("Slow response time affects trust")
  if (metrics.completionRate < 0.85) cautions.push("Completion history needs improvement")

  if (drivers.length === 0) drivers.push("Steady but still building trust history")

  return {
    score,
    level:
      score >= 90
        ? "elite"
        : score >= 80
          ? "trusted"
          : score >= 65
            ? "developing"
            : "foundation",
    drivers,
    cautions,
  }
}

export const getTrustRiskLevel = (score: number): RiskLevel => {
  if (score >= 85) return "low"
  if (score >= 70) return "medium"
  if (score >= 55) return "high"
  return "critical"
}
