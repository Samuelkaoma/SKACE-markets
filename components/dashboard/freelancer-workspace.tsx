"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { LoaderCircle, Send, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { GlassCard } from "@/components/glass-card"
import { postJson } from "@/lib/client/api"
import type { FreelancerDashboardSnapshot } from "@/lib/server/dashboard-service"

export function FreelancerWorkspace({
  data,
}: {
  data: FreelancerDashboardSnapshot
}) {
  const router = useRouter()
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    data.jobRecommendations[0]?.id ?? null,
  )
  const [coverLetter, setCoverLetter] = useState(
    "I can deliver this work with clear communication, milestone updates, and documented handoff notes.",
  )
  const [proposedRate, setProposedRate] = useState(0)
  const [estimatedDays, setEstimatedDays] = useState(7)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [completionNotes, setCompletionNotes] = useState<Record<string, string>>({})
  const [disputeReasons, setDisputeReasons] = useState<Record<string, string>>({})

  const selectedJob = useMemo(
    () => data.jobRecommendations.find((job) => job.id === selectedJobId) ?? null,
    [data.jobRecommendations, selectedJobId],
  )

  const handleApply = async () => {
    if (!selectedJob) {
      return
    }

    setPendingAction(`apply-${selectedJob.id}`)
    setStatusMessage(null)
    setError(null)

    try {
      await postJson("/api/applications", {
        jobId: selectedJob.id,
        coverLetter,
        proposedRate,
        estimatedDays,
      })
      setStatusMessage(`Application sent for ${selectedJob.title}.`)
      router.refresh()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Application failed.",
      )
    } finally {
      setPendingAction(null)
    }
  }

  const handleSubmitWork = async (hireId: string) => {
    setPendingAction(`submit-${hireId}`)
    setStatusMessage(null)
    setError(null)

    try {
      await postJson("/api/hires/submit", {
        hireId,
        completionSummary:
          completionNotes[hireId] ??
          "Work completed with documentation, proof, and a clean handoff summary.",
      })
      setStatusMessage("Work submitted for employer review.")
      router.refresh()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Submission failed.",
      )
    } finally {
      setPendingAction(null)
    }
  }

  const handleOpenDispute = async (hireId: string) => {
    setPendingAction(`dispute-${hireId}`)
    setStatusMessage(null)
    setError(null)

    try {
      await postJson("/api/disputes", {
        hireId,
        reason:
          disputeReasons[hireId] ??
          "I need a manual review of the protected funds and the project outcome.",
      })
      setStatusMessage("Dispute opened and routed to the admin workspace.")
      router.refresh()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Dispute failed.")
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <GlassCard hover={false}>
        <div className="mb-4">
          <p className="text-sm font-semibold text-foreground">Apply to recommended work</p>
          <p className="text-sm text-muted-foreground">
            Select a role, tune your proposal, and send it straight into the persisted
            application pipeline.
          </p>
        </div>

        <div className="space-y-3">
          {data.jobRecommendations.map((job) => (
            <button
              key={job.id}
              type="button"
              onClick={() => {
                setSelectedJobId(job.id)
                setProposedRate(Math.max(1, Math.round(job.budgetMin)))
              }}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                selectedJobId === job.id
                  ? "border-primary/50 bg-primary/10"
                  : "border-border/40 bg-background/40 hover:border-primary/20"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{job.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {job.company} · {job.category} · {job.workMode}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {job.match}% fit
                </span>
              </div>
            </button>
          ))}
        </div>

        {selectedJob && (
          <div className="mt-5 space-y-4 rounded-2xl border border-border/40 bg-background/30 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">{selectedJob.title}</p>
              <p className="text-xs text-muted-foreground">{selectedJob.budget}</p>
            </div>
            <Textarea
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              className="min-h-28"
              placeholder="Why are you a strong fit?"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="number"
                value={proposedRate}
                onChange={(event) => setProposedRate(Number(event.target.value))}
                placeholder="Proposed rate"
              />
              <Input
                type="number"
                value={estimatedDays}
                onChange={(event) => setEstimatedDays(Number(event.target.value))}
                placeholder="Estimated days"
              />
            </div>
            <Button onClick={() => void handleApply()} disabled={pendingAction === `apply-${selectedJob.id}`}>
              {pendingAction === `apply-${selectedJob.id}` && (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}
              <Send className="h-4 w-4" />
              Submit application
            </Button>
          </div>
        )}
      </GlassCard>

      <GlassCard hover={false}>
        <div className="mb-4">
          <p className="text-sm font-semibold text-foreground">Active hire actions</p>
          <p className="text-sm text-muted-foreground">
            Submit work for review, or raise a dispute if escrow needs a manual decision.
          </p>
        </div>

        <div className="space-y-4">
          {data.activeHires.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/40 px-4 py-6 text-sm text-muted-foreground">
              No active hires yet. Apply to one of the recommended jobs to start a tracked workflow.
            </div>
          ) : (
            data.activeHires.map((hire) => (
              <div key={hire.id} className="rounded-2xl border border-border/40 bg-background/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{hire.jobTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {hire.company} · {hire.status} · {hire.amount.toLocaleString()} {hire.currency}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {hire.escrow?.status ?? "UNFUNDED"}
                  </span>
                </div>

                <Textarea
                  className="mt-4 min-h-24"
                  placeholder="Completion summary or proof notes"
                  value={
                    completionNotes[hire.id] ??
                    hire.completionSummary ??
                    "Completed the agreed work and attached supporting notes."
                  }
                  onChange={(event) =>
                    setCompletionNotes((current) => ({
                      ...current,
                      [hire.id]: event.target.value,
                    }))
                  }
                />

                <div className="mt-3 flex flex-wrap gap-3">
                  <Button
                    onClick={() => void handleSubmitWork(hire.id)}
                    disabled={hire.status !== "active" || pendingAction === `submit-${hire.id}`}
                  >
                    {pendingAction === `submit-${hire.id}` && (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    )}
                    Submit work
                  </Button>
                </div>

                <Textarea
                  className="mt-4 min-h-20"
                  placeholder="Dispute reason if something needs review"
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
                  onClick={() => void handleOpenDispute(hire.id)}
                  disabled={pendingAction === `dispute-${hire.id}` || hire.escrow?.status === "DISPUTED"}
                >
                  {pendingAction === `dispute-${hire.id}` && (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  )}
                  <ShieldAlert className="h-4 w-4" />
                  Open dispute
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-border/40 bg-background/20 p-4">
          <p className="text-sm font-semibold text-foreground">Application pipeline</p>
          <div className="mt-3 space-y-3">
            {data.applications.map((application) => (
              <div
                key={application.id}
                className="flex items-center justify-between rounded-xl bg-background/40 px-3 py-2"
              >
                <div>
                  <p className="text-sm text-foreground">{application.jobTitle}</p>
                  <p className="text-xs text-muted-foreground">{application.status}</p>
                </div>
                <span className="text-xs font-medium text-primary">{application.fitScore}% fit</span>
              </div>
            ))}
          </div>
        </div>

        {statusMessage && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {statusMessage}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
