// lib/ai/trustScore.ts
import { TrustMetrics } from "../types";

export const calculateTrustScore = (metrics: TrustMetrics): number => {
  // Weights based on marketplace reliability standards
  const WEIGHTS = {
    COMPLETION: 0.40, // 40% - Do they finish what they start?
    REVIEWS: 0.30,    // 30% - Do people like their work?
    FORUM: 0.15,      // 15% - Community helpfulness
    SPEED: 0.15       // 15% - Response time
  };

  const completionScore = metrics.completionRate * 100 * WEIGHTS.COMPLETION;
  const reviewScore = (metrics.peerReviewAvg / 5) * 100 * WEIGHTS.REVIEWS;
  const forumScore = Math.min((metrics.forumActivity / 20) * 100, 100) * WEIGHTS.FORUM;
  
  // Speed Score: Lower response time (minutes) is better. 
  // Max points for < 30 mins, 0 points for > 24 hours.
  const speedScore = Math.max(0, (1 - metrics.responseTimeMin / 1440)) * 100 * WEIGHTS.SPEED;

  const totalScore = completionScore + reviewScore + forumScore + speedScore;

  // Final Penalty: Reports slash the score by 15 points each
  const finalScore = totalScore - (metrics.reportCount * 15);

  return Math.round(Math.max(0, Math.min(100, finalScore)));
};