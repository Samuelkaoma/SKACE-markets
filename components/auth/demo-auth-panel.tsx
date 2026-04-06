"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { Briefcase, LoaderCircle, RefreshCcw, ShieldCheck, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { postJson } from "@/lib/client/api"
import type { DemoAccount, SessionUser } from "@/lib/types"

const roleIcons = {
  freelancer: Users,
  employer: Briefcase,
  admin: ShieldCheck,
}

export function DemoAuthPanel({ accounts }: { accounts: DemoAccount[] }) {
  const router = useRouter()
  const [pendingAccountId, setPendingAccountId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resetting, startResetTransition] = useTransition()

  const groupedAccounts = useMemo(() => {
    return {
      freelancer: accounts.filter((account) => account.role === "freelancer"),
      employer: accounts.filter((account) => account.role === "employer"),
      admin: accounts.filter((account) => account.role === "admin"),
    }
  }, [accounts])

  const handleLogin = async (account: DemoAccount) => {
    setPendingAccountId(account.id)
    setError(null)

    try {
      await postJson<{ user: SessionUser }, { userId: string; demoCode: string }>(
        "/api/auth/login",
        {
          userId: account.id,
          demoCode: account.demoCode,
        },
      )

      router.push(account.dashboardPath)
      router.refresh()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Sign-in failed. Please try again.",
      )
    } finally {
      setPendingAccountId(null)
    }
  }

  const handleReset = () => {
    startResetTransition(() => {
      void (async () => {
        setError(null)

        try {
          await postJson<{ reset: true }, Record<string, never>>("/api/auth/reset", {})
          router.refresh()
        } catch (caughtError) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Reset failed. Please try again.",
          )
        }
      })()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Demo access</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
            Pick a real role and test the live marketplace
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            These accounts use persisted local SQLite data. You can post jobs, apply, hire,
            fund escrow, submit work, open disputes, resolve cases, and then reset the
            environment whenever you want a clean run.
          </p>
        </div>
        <Button variant="outline" onClick={handleReset} disabled={resetting}>
          {resetting && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {!resetting && <RefreshCcw className="h-4 w-4" />}
          Reset demo data
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {(["freelancer", "employer", "admin"] as const).map((role) => {
          const accountsForRole = groupedAccounts[role]
          const Icon = roleIcons[role]

          return (
            <GlassCard key={role} className="h-full">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold capitalize text-foreground">{role}</p>
                  <p className="text-xs text-muted-foreground">
                    {role === "freelancer"
                      ? "Apply, submit work, and build trust."
                      : role === "employer"
                        ? "Post roles, hire, and fund escrow."
                        : "Monitor disputes, fraud, and resets."}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {accountsForRole.map((account) => (
                  <div
                    key={account.id}
                    className="rounded-2xl border border-border/40 bg-background/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{account.name}</p>
                        <p className="text-xs text-muted-foreground">{account.summary}</p>
                        <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-primary/80">
                          {account.email}
                        </p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                        {account.demoCode}
                      </span>
                    </div>

                    <Button
                      className="mt-4 w-full"
                      onClick={() => void handleLogin(account)}
                      disabled={pendingAccountId === account.id}
                    >
                      {pendingAccountId === account.id && (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      )}
                      Enter {role} workspace
                    </Button>
                  </div>
                ))}
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
