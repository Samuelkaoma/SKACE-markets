import type { ScamResult } from "@/lib/types"

const TRIGGER_GROUPS = [
  {
    weight: 25,
    phrases: ["whatsapp", "telegram", "dm me", "private message", "outside the platform"],
  },
  {
    weight: 35,
    phrases: ["payment before", "upfront fee", "security deposit", "easy money", "investment"],
  },
  {
    weight: 20,
    phrases: ["verify with code", "send otp", "bank login", "pay first"],
  },
]

export const analyzeContentForScam = async (text: string): Promise<ScamResult> => {
  const normalizedText = text.trim().toLowerCase()

  if (!normalizedText) {
    return {
      score: 0,
      level: "low",
      reason: "No content was provided for analysis.",
      flaggedPhrases: [],
      recommendedActions: ["Paste the message or job brief you want reviewed."],
    }
  }

  let score = 0
  const flaggedPhrases = new Set<string>()

  for (const group of TRIGGER_GROUPS) {
    for (const phrase of group.phrases) {
      if (normalizedText.includes(phrase)) {
        score += group.weight
        flaggedPhrases.add(phrase)
      }
    }
  }

  if (normalizedText.includes("urgent") || normalizedText.includes("immediately")) {
    score += 10
  }

  if (normalizedText.includes("guaranteed income") || normalizedText.includes("risk free")) {
    score += 15
  }

  const boundedScore = Math.min(score, 100)
  const level =
    boundedScore >= 75
      ? "critical"
      : boundedScore >= 55
        ? "high"
        : boundedScore >= 30
          ? "medium"
          : "low"

  const recommendedActions =
    level === "critical" || level === "high"
      ? [
          "Keep all communication and payments on-platform.",
          "Do not share verification codes or move to private channels.",
          "Require escrow or verified payment before delivery.",
        ]
      : level === "medium"
        ? [
            "Ask follow-up questions and request verified identity.",
            "Use escrow before sharing final work.",
          ]
        : ["No major scam markers found. Continue with standard due diligence."]

  return {
    score: boundedScore,
    level,
    reason:
      level === "low"
        ? "No significant scam patterns were detected."
        : `Detected ${flaggedPhrases.size} suspicious patterns that commonly appear in off-platform or advance-fee scams.`,
    flaggedPhrases: [...flaggedPhrases],
    recommendedActions,
  }
}
