"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { LoaderCircle, Lock, PlusCircle, ShieldAlert, Wallet } from "lucide-react"

import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { postJson } from "@/lib/client/api"
import type { EmployerDashboardSnapshot } from "@/lib/server/dashboard-service"

const defaultJobForm = {
  title: "",
  category: "digital",
  tags: "React, TypeScript",
  location: "Lusaka",
  workMode: "hybrid",
  rateType: "fixed",
  budgetMin: 3000,
  budgetMax: 5000,
  currency: "ZMW",
  description: "",
  shiftHours: "",
  requiresTransport: false,
  requiresEquipment: false,
  certifications: "",
  tools: "",
  experienceLevel: "mid",
}

export function EmployerWorkspace({
  data,
}: {
  data: EmployerDashboardSnapshot
}) {
  const router = useRouter()
  const [jobForm, setJobForm] = useState(defaultJobForm)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [hireScopes, setHireScopes] = useState<Record<string, string>>({})
  const [hireAmounts, setHireAmounts] = useState<Record<string, number>>({})
  const [disputeReasons, setDisputeReasons] = useState<Record<string, string>>({})
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCreateJob = async () => {
    setPendingAction("create-job")
    setStatusMessage(null)
    setError(null)

    try {
      await postJson("/api/jobs", {
        ...jobForm,
        tags: jobForm.tags.split(",").map((item) => item.trim()).filter(Boolean),
        certifications: jobForm.certifications
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        tools: jobForm.tools.split(",").map((item) => item.trim()).filter(Boolean),
        shiftHours: jobForm.shiftHours ? Number(jobForm.shiftHours) : null,
      })
      setJobForm(defaultJobForm)
      setStatusMessage("Job posted successfully.")
      router.refresh()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Job creation failed.")
    } finally {
      setPendingAction(null)
    }
  }

  const handleHire = async (applicationId: string) => {
    setPendingAction(`hire-${applicationId}`)
    setStatusMessage(null)
    setError(null)

    try {
      await postJson("/api/hires", {
        applicationId,
        agreedAmount: hireAmounts[applicationId] ?? 0,
        scopeSummary:
          hireScopes[applicationId] ??
          "Deliver the agreed scope with milestone updates and a clean handoff.",
      })
      setStatusMessage("Application converted into an active hire.")
      router.refresh()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Hire failed.")
    } finally {
      setPendingAction(null)
    }
  }

  const handleFundEscrow = async (hireId: string) => {
    setPendingAction(`fund-${hireId}`)
    setStatusMessage(null)
    setError(null)

    try {
      await postJson("/api/escrows/fund", { hireId })
      setStatusMessage("Escrow funded successfully.")
      router.refresh()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Funding failed.")
    } finally {
      setPendingAction(null)
    }
  }

  const handleReleaseEscrow = async (hireId: string) => {
    setPendingAction(`release-${hireId}`)
    setStatusMessage(null)
    setError(null)

    try {
      await postJson("/api/escrows/release", { hireId })
      setStatusMessage("Escrow released and payout completed.")
      router.refresh()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Release failed.")
    } finally {
      setPendingAction(null)
    }
  }

  const handleDispute = async (hireId: string) => {
    setPendingAction(`dispute-${hireId}`)
    setStatusMessage(null)
    setError(null)

    try {
      await postJson("/api/disputes", {
        hireId,
        reason:
          disputeReasons[hireId] ??
          "This hire needs a manual review before protected funds can move.",
      })
      setStatusMessage("Dispute opened and sent to the admin queue.")
      router.refresh()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Dispute failed.")
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
      <GlassCard hover={false}>
        <div className="mb-4">
          <p className="text-sm font-semibold text-foreground">Post a new job</p>
          <p className="text-sm text-muted-foreground">
            Digital, field, trade, and operations roles all use the same persisted workflow.
          </p>
        </div>

        <div className="grid gap-3">
          <Input
            placeholder="Job title"
            value={jobForm.title}
            onChange={(event) => setJobForm((current) => ({ ...current, title: event.target.value }))}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={jobForm.category}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, category: event.target.value }))
              }
              className="h-10 rounded-md border border-border bg-transparent px-3 text-sm text-foreground"
            >
              <option value="digital">Digital</option>
              <option value="operations">Operations</option>
              <option value="field">Field</option>
              <option value="trade">Trade</option>
            </select>
            <select
              value={jobForm.workMode}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, workMode: event.target.value }))
              }
              className="h-10 rounded-md border border-border bg-transparent px-3 text-sm text-foreground"
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Tags (comma separated)"
              value={jobForm.tags}
              onChange={(event) => setJobForm((current) => ({ ...current, tags: event.target.value }))}
            />
            <Input
              placeholder="Location"
              value={jobForm.location}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, location: event.target.value }))
              }
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="number"
              placeholder="Budget min"
              value={jobForm.budgetMin}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, budgetMin: Number(event.target.value) }))
              }
            />
            <Input
              type="number"
              placeholder="Budget max"
              value={jobForm.budgetMax}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, budgetMax: Number(event.target.value) }))
              }
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Required certifications"
              value={jobForm.certifications}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, certifications: event.target.value }))
              }
            />
            <Input
              placeholder="Tools or equipment"
              value={jobForm.tools}
              onChange={(event) => setJobForm((current) => ({ ...current, tools: event.target.value }))}
            />
          </div>
          <Textarea
            placeholder="Describe the work, constraints, and success criteria"
            className="min-h-28"
            value={jobForm.description}
            onChange={(event) =>
              setJobForm((current) => ({ ...current, description: event.target.value }))
            }
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={jobForm.rateType}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, rateType: event.target.value }))
              }
              className="h-10 rounded-md border border-border bg-transparent px-3 text-sm text-foreground"
            >
              <option value="fixed">Fixed</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <select
              value={jobForm.experienceLevel}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, experienceLevel: event.target.value }))
              }
              className="h-10 rounded-md border border-border bg-transparent px-3 text-sm text-foreground"
            >
              <option value="entry">Entry</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>
            <Input
              placeholder="Shift hours"
              value={jobForm.shiftHours}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, shiftHours: event.target.value }))
              }
            />
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={jobForm.requiresTransport}
                onChange={(event) =>
                  setJobForm((current) => ({ ...current, requiresTransport: event.target.checked }))
                }
              />
              Transport required
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={jobForm.requiresEquipment}
                onChange={(event) =>
                  setJobForm((current) => ({ ...current, requiresEquipment: event.target.checked }))
                }
              />
              Equipment required
            </label>
          </div>
          <Button onClick={() => void handleCreateJob()} disabled={pendingAction === "create-job"}>
            {pendingAction === "create-job" && <LoaderCircle className="h-4 w-4 animate-spin" />}
            <PlusCircle className="h-4 w-4" />
            Publish job
          </Button>
        </div>
      </GlassCard>

      <div className="space-y-6">
        <GlassCard hover={false}>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Applicant conversion</p>
              <p className="text-sm text-muted-foreground">
                Turn trusted applicants into hires with an agreed scope and amount.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary">
              Wallet: {data.profile.walletBalance}
            </div>
          </div>

          <div className="space-y-4">
            {data.applications.map((application) => (
              <div key={application.id} className="rounded-2xl border border-border/40 bg-background/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{application.freelancerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {application.jobTitle} · {application.status} · {application.fitScore}% fit
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    Trust {application.freelancerTrustScore}
                  </span>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Input
                    type="number"
                    placeholder="Agreed amount"
                    value={hireAmounts[application.id] ?? application.proposedRate}
                    onChange={(event) =>
                      setHireAmounts((current) => ({
                        ...current,
                        [application.id]: Number(event.target.value),
                      }))
                    }
                  />
                  <Input value={application.rateType} disabled />
                </div>

                <Textarea
                  className="mt-3 min-h-24"
                  placeholder="Scope summary"
                  value={
                    hireScopes[application.id] ??
                    `Deliver ${application.jobTitle} with weekly updates and a final handoff.`
                  }
                  onChange={(event) =>
                    setHireScopes((current) => ({
                      ...current,
                      [application.id]: event.target.value,
                    }))
                  }
                />

                <Button
                  className="mt-3"
                  onClick={() => void handleHire(application.id)}
                  disabled={pendingAction === `hire-${application.id}` || application.status === "hired"}
                >
                  {pendingAction === `hire-${application.id}` && (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  )}
                  Create hire
                </Button>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground">Escrow and dispute control</p>
            <p className="text-sm text-muted-foreground">
              Fund protection after hiring, release when work is complete, or route edge cases to admin.
            </p>
          </div>

          <div className="space-y-4">
            {data.hires.map((hire) => (
              <div key={hire.id} className="rounded-2xl border border-border/40 bg-background/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{hire.jobTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {hire.freelancerName} · {hire.status} · {hire.amount.toLocaleString()} {hire.currency}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {hire.escrow?.status ?? "UNFUNDED"}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => void handleFundEscrow(hire.id)}
                    disabled={Boolean(hire.escrow) || pendingAction === `fund-${hire.id}`}
                  >
                    {pendingAction === `fund-${hire.id}` && (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    )}
                    <Lock className="h-4 w-4" />
                    Fund escrow
                  </Button>
                  <Button
                    onClick={() => void handleReleaseEscrow(hire.id)}
                    disabled={
                      !hire.escrow ||
                      hire.escrow.status === "RELEASED" ||
                      pendingAction === `release-${hire.id}`
                    }
                  >
                    {pendingAction === `release-${hire.id}` && (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    )}
                    <Wallet className="h-4 w-4" />
                    Release payout
                  </Button>
                </div>

                <Textarea
                  className="mt-4 min-h-20"
                  placeholder="Dispute reason"
                  value={disputeReasons[hire.id] ?? ""}
                  onChange={(event) =>
                    setDisputeReasons((current) => ({
                      ...current,
                      [hire.id]: event.target.value,
                    }))
                  }
                />
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => void handleDispute(hire.id)}
                  disabled={hire.escrow?.status === "DISPUTED" || pendingAction === `dispute-${hire.id}`}
                >
                  {pendingAction === `dispute-${hire.id}` && (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  )}
                  <ShieldAlert className="h-4 w-4" />
                  Open dispute
                </Button>
              </div>
            ))}
          </div>
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
