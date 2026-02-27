"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface StatCardProps {
  label: string
  value: string
  icon: ReactNode
  change?: string
  changeType?: "positive" | "negative" | "neutral"
}

export function StatCard({
  label,
  value,
  icon,
  change,
  changeType = "neutral",
}: StatCardProps) {
  const changeColor =
    changeType === "positive"
      ? "text-emerald-400"
      : changeType === "negative"
        ? "text-red-400"
        : "text-muted-foreground"

  return (
    <motion.div
      className="glass rounded-xl p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {change && (
            <p className={`mt-1 text-xs font-medium ${changeColor}`}>
              {change}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
