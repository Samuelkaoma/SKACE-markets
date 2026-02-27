"use client"

import { motion } from "framer-motion"

interface RiskBadgeProps {
  level: "low" | "medium" | "high" | "critical"
  label?: string
}

const riskConfig = {
  low: {
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    pulse: "bg-emerald-400",
    text: "Low Risk",
  },
  medium: {
    color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    pulse: "bg-amber-400",
    text: "Medium Risk",
  },
  high: {
    color: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    pulse: "bg-orange-400",
    text: "High Risk",
  },
  critical: {
    color: "bg-red-500/10 text-red-400 border-red-500/30",
    pulse: "bg-red-400",
    text: "Critical Risk",
  },
}

export function RiskBadge({ level, label }: RiskBadgeProps) {
  const config = riskConfig[level]

  return (
    <motion.div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${config.color}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config.pulse}`}
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${config.pulse}`}
        />
      </span>
      {label || config.text}
    </motion.div>
  )
}
