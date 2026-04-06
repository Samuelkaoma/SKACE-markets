export const platformSignals = {
  trustTrend: [
    { month: "Sep", index: 79 },
    { month: "Oct", index: 81 },
    { month: "Nov", index: 84 },
    { month: "Dec", index: 86 },
    { month: "Jan", index: 88 },
    { month: "Feb", index: 90 },
  ],
  fraudDetectionMetrics: [
    { month: "Sep", detected: 12, blocked: 11, missed: 1 },
    { month: "Oct", detected: 16, blocked: 14, missed: 2 },
    { month: "Nov", detected: 14, blocked: 13, missed: 1 },
    { month: "Dec", detected: 11, blocked: 10, missed: 1 },
    { month: "Jan", detected: 10, blocked: 9, missed: 1 },
    { month: "Feb", detected: 8, blocked: 8, missed: 0 },
  ],
  growthData: [
    { month: "Sep", freelancers: 1220, employers: 214, transactions: 1630 },
    { month: "Oct", freelancers: 1340, employers: 238, transactions: 1880 },
    { month: "Nov", freelancers: 1480, employers: 261, transactions: 2140 },
    { month: "Dec", freelancers: 1620, employers: 289, transactions: 2440 },
    { month: "Jan", freelancers: 1790, employers: 317, transactions: 2810 },
    { month: "Feb", freelancers: 1980, employers: 347, transactions: 3230 },
  ],
  decisionMetrics: [
    { metric: "Trust recalculations", value: 96 },
    { metric: "Escrow automation", value: 89 },
    { metric: "Match fit average", value: 87 },
    { metric: "Manual review share", value: 14 },
    { metric: "Dispute containment", value: 91 },
  ],
  riskHeatmapData: [
    { region: "Lusaka", low: 78, medium: 15, high: 5, critical: 2 },
    { region: "Copperbelt", low: 75, medium: 16, high: 7, critical: 2 },
    { region: "Central", low: 72, medium: 18, high: 7, critical: 3 },
    { region: "Remote", low: 68, medium: 21, high: 8, critical: 3 },
  ],
}
