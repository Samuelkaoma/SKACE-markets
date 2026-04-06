import type { RiskLevel } from "@/lib/types"

export interface ActivityLog {
  userId: string
  action: "JOB_POST" | "LOGIN" | "MESSAGE"
  timestamp: number
}

export const detectAnomaly = (userLogs: ActivityLog[]) => {
  const TEN_MINUTES = 10 * 60 * 1000
  const now = Date.now()

  const recentActions = userLogs.filter((log) => now - log.timestamp < TEN_MINUTES)
  const jobPosts = recentActions.filter((action) => action.action === "JOB_POST").length
  const logins = recentActions.filter((action) => action.action === "LOGIN").length
  const messages = recentActions.filter((action) => action.action === "MESSAGE").length

  let risk: RiskLevel = "low"
  let score = 5
  let reason = "Behavior is within expected marketplace thresholds."

  if (jobPosts >= 6 || logins >= 8) {
    risk = "critical"
    score = 92
    reason = "Burst activity strongly resembles bot-like or compromised-account behavior."
  } else if (jobPosts >= 4 || messages >= 15) {
    risk = "high"
    score = 74
    reason = "Sustained activity spike detected across posting or messaging."
  } else if (jobPosts >= 3 || logins >= 5) {
    risk = "medium"
    score = 46
    reason = "Recent activity is elevated and worth monitoring."
  }

  return { risk, score, reason }
}
