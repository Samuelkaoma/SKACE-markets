import { RiskLevel } from "../types";

export interface ActivityLog {
  userId: string;
  action: 'JOB_POST' | 'LOGIN' | 'MESSAGE';
  timestamp: number;
}

export const detectAnomaly = (userLogs: ActivityLog[]) => {
  const TEN_MINUTES = 10 * 60 * 1000;
  const now = Date.now();
  
  // Filter for actions in the last 10 minutes
  const recentActions = userLogs.filter(log => (now - log.timestamp) < TEN_MINUTES);

  // Trigger: More than 5 job posts in 10 minutes is a "Bot" behavior in Zambia's market
  const jobPosts = recentActions.filter(a => a.action === 'JOB_POST').length;
  
  let risk: RiskLevel = 'Low';
  let reason = "Normal behavioral patterns.";

  if (jobPosts > 5) {
    risk = 'High';
    reason = "Excessive job posting frequency (Potential Bot/Scam spam).";
  } else if (jobPosts > 3) {
    risk = 'Medium';
    reason = "Unusually high activity detected.";
  }

  return { risk, score: jobPosts * 20, reason };
};