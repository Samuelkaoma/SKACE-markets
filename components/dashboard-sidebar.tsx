"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import {
  Activity,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Home,
  ShieldCheck,
  Users,
} from "lucide-react"

import type { SessionUser } from "@/lib/types"

const roleConfig = {
  freelancer: {
    href: "/dashboard/freelancer",
    label: "Freelancer Workspace",
    icon: Users,
  },
  employer: {
    href: "/dashboard/employer",
    label: "Employer Workspace",
    icon: Briefcase,
  },
  admin: {
    href: "/dashboard/admin",
    label: "Admin Intelligence",
    icon: ShieldCheck,
  },
}

export function DashboardSidebar({ session }: { session: SessionUser }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    roleConfig[session.role],
    { href: "/auth", label: "Switch Account", icon: Activity },
  ]

  return (
    <motion.aside
      className="glass sticky top-0 z-40 flex h-screen flex-col border-r border-border/40"
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      <div className="border-b border-border/40 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <p className="text-base font-bold text-foreground">SKACE Markets</p>
                <p className="text-xs text-muted-foreground">{session.summary}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="border-b border-border/40 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            {session.name
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="min-w-0 overflow-hidden"
              >
                <p className="truncate text-sm font-semibold text-foreground">{session.name}</p>
                <p className="truncate text-xs capitalize text-muted-foreground">{session.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.15 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                    layoutId="sidebar-indicator"
                  />
                )}
                <item.icon className="h-5 w-5 shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border/40 p-3">
        <button
          onClick={() => setCollapsed((current) => !current)}
          className="flex w-full items-center justify-center rounded-xl py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </motion.aside>
  )
}
