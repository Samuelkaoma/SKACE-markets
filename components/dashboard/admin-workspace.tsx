"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { LoaderCircle, RefreshCcw, ShieldCheck, Wallet } from "lucide-react"

import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { postJson } from "@/lib/client/api"
import type { AdminDashboardSnapshot } from "@/lib/server/dashboard-service"

export function AdminWorkspace({
  data,
}: {
  data: AdminDashboardSnapshot
}) {
  const router = useRouter()
  const [resolutions, setResolutions] = useState<Record<string, string>>({})
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const resolveDispute = async (disputeId: string, action: "release" | "refund") => {
    setPendingAction(`${action}-${disputeId}`)
    setStatusMessage(null)
    setError(null)

    try {
      await postJson("/api/disputes/resolve", {
        disputeId,
        action,
        resolution:
          resolutions[disputeId] ??
          (action === "release"
            ? "Admin review confirmed release to the freelancer."
            : "Admin review confirmed refund to the employer."),
      })
      setStatusMessage(`Dispute resolved with ${action}.`)
      router.refresh()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Dispute resolution failed.",
      )
    } finally {
      setPendingAction(null)
    }
  }

  const resetDemo = async () => {
    setPendingAction("reset")
    setStatusMessage(null)
    setError(null)

    try {
      await postJson("/api/auth/reset", {})
      setStatusMessage("Demo data reset. You can sign back in from the auth page.")
      router.push("/auth")
      router.refresh()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Reset failed.",
      )
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <GlassCard hover={false}>
        <div className="mb-4">
          <p className="text-sm font-semibold text-foreground">Dispute operations</p>
          <p className="text-sm text-muted-foreground">
            Resolve escrow disputes with an explicit release or refund decision.
          </p>
        </div>

        <div className="space-y-4">
          {data.disputes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/40 px-4 py-6 text-sm text-muted-foreground">
              No disputes are currently waiting for admin action.
            </div>
          ) : (
            data.disputes.map((dispute) => (
              <div key={dispute.id} className="rounded-2xl border border-border/40 bg-background/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{dispute.jobTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {dispute.company} · {dispute.holdReference} · opened by {dispute.openedByName}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {dispute.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{dispute.reason}</p>
                <Textarea
                  className="mt-4 min-h-24"
                  placeholder="Resolution notes"
                  value={resolutions[dispute.id] ?? dispute.resolution ?? ""}
                  onChange={(event) =>
                    setResolutions((current) => ({
                      ...current,
                      [dispute.id]: event.target.value,
                    }))
                  }
                />
                <div className="mt-3 flex flex-wrap gap-3">
                  <Button
                    onClick={() => void resolveDispute(dispute.id, "release")}
                    disabled={pendingAction === `release-${dispute.id}`}
                  >
                    {pendingAction === `release-${dispute.id}` && (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    )}
                    <Wallet className="h-4 w-4" />
                    Release to freelancer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void resolveDispute(dispute.id, "refund")}
                    disabled={pendingAction === `refund-${dispute.id}`}
                  >
                    {pendingAction === `refund-${dispute.id}` && (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    )}
                    <ShieldCheck className="h-4 w-4" />
                    Refund employer
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      <div className="space-y-6">
        <GlassCard hover={false}>
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground">Flag watchlist</p>
            <p className="text-sm text-muted-foreground">
              Recent platform alerts surfaced from the live risk table.
            </p>
          </div>
          <div className="space-y-3">
            {data.recentFlags.map((flag) => (
              <div key={flag.id} className="rounded-2xl border border-border/40 bg-background/30 p-4">
                <p className="text-sm font-semibold text-foreground">{flag.account}</p>
                <p className="text-xs text-muted-foreground">
                  {flag.type} · {flag.detectedAt}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{flag.reason}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground">Demo operations</p>
            <p className="text-sm text-muted-foreground">
              Reset the local database when you want a fresh test cycle.
            </p>
          </div>
          <Button onClick={() => void resetDemo()} disabled={pendingAction === "reset"}>
            {pendingAction === "reset" && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {!pendingAction && <RefreshCcw className="h-4 w-4" />}
            Reset marketplace data
          </Button>
        </GlassCard>

        {statusMessage && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {statusMessage}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
