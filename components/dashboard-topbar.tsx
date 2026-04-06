"use client"

import { motion } from "framer-motion"
import { Bell, LogOut, Moon, Sun } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { postJson } from "@/lib/client/api"
import type { SessionUser } from "@/lib/types"

export function DashboardTopbar({
  title,
  session,
}: {
  title: string
  session: SessionUser
}) {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [loggingOut, setLoggingOut] = useState(false)
  const isDark = resolvedTheme !== "light"

  const handleLogout = async () => {
    setLoggingOut(true)

    try {
      await postJson<{ signedOut: true }, Record<string, never>>("/api/auth/logout", {})
      router.push("/auth")
      router.refresh()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="glass sticky top-0 z-30 flex items-center justify-between border-b border-border/40 px-6 py-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/80">
          SKACE Control Surface
        </p>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary md:block">
          Signed in as {session.name}
        </div>

        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        <Button variant="outline" size="sm" onClick={() => void handleLogout()} disabled={loggingOut}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>

        <motion.div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary"
          whileHover={{ scale: 1.05 }}
        >
          {session.name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")}
        </motion.div>
      </div>
    </header>
  )
}
