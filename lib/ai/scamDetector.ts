// lib/ai/scamDetector.ts
import { ScamResult, RiskLevel } from "../types";

export const analyzeContentForScam = async (text: string): Promise<ScamResult> => {
  const lowercaseText = text.toLowerCase();
  let score = 0;
  const flaggedPhrases: string[] = [];

  // 1. Suspicious Contact Methods (High Weight)
  const contactTriggers = ["whatsapp", "telegram", "dm me", "private message", "outside the platform"];
  contactTriggers.forEach(phrase => {
    if (lowercaseText.includes(phrase)) {
      score += 25;
      flaggedPhrases.push(phrase);
    }
  });

  // 2. Urgent/Financial Red Flags
  const financialTriggers = ["payment before", "upfront fee", "security deposit", "easy money", "investment"];
  financialTriggers.forEach(phrase => {
    if (lowercaseText.includes(phrase)) {
      score += 35;
      flaggedPhrases.push(phrase);
    }
  });

  // 3. Fake Urgency
  if (lowercaseText.includes("immediately") || lowercaseText.includes("urgent")) {
    score += 10;
  }

  // Calculate Level
  let level: RiskLevel = "Low";
  if (score >= 60) level = "High";
  else if (score >= 30) level = "Medium";

  return {
    score: Math.min(score, 100),
    level,
    reason: score > 30 
      ? `Found ${flaggedPhrases.length} suspicious patterns typical of employment scams.` 
      : "No significant risks detected.",
    flaggedPhrases
  };
};