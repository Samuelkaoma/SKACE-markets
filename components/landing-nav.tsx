"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Activity, Menu, X } from "lucide-react"
import { useState } from "react"

const links = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#trust", label: "Trust Engine" },
]

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <motion.nav
      className="glass fixed top-0 right-0 left-0 z-50 border-b border-border/30"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 glow-cyan-sm">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-bold text-foreground">SKACE</span>
          <span className="text-xs text-muted-foreground">Markets</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/dashboard/freelancer"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 glow-cyan-sm"
          >
            Launch App
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="text-muted-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          className="glass border-t border-border/30 px-6 pb-6 pt-4 md:hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/dashboard/freelancer"
              className="rounded-lg bg-primary px-5 py-2 text-center text-sm font-medium text-primary-foreground"
            >
              Launch App
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
