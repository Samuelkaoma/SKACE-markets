export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface ScamResult {
  score: number;
  level: RiskLevel;
  reason: string;
  flaggedPhrases: string[];
}

export interface TrustMetrics {
  completionRate: number; 
  peerReviewAvg: number;  
  forumActivity: number;
  responseTimeMin: number;
  reportCount: number;
}

export interface UserProfile {
  id: string;
  name: string;
  location: string;
  trustScore: number;
  walletBalance: number;
}