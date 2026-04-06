"use client"

import { motion } from "framer-motion"
import {
  AlertTriangle,
  Brain,
  LoaderCircle,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { useDeferredValue, useEffect, useState, useTransition } from "react"

import { GlassCard } from "@/components/glass-card"
import { RiskBadge } from "@/components/risk-badge"
import { TrustMeter } from "@/components/trust-meter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { apiRequest } from "@/lib/client/api"
import type { FreelancerOption } from "@/lib/server/marketplace-repository"
import type { RecommendedJob, ScamResult, TrustMetrics } from "@/lib/types"
import { useRiskAnalysis } from "@/hooks/useRiskAnalysis"
import { useTrustScore } from "@/hooks/useTrustScore"
import { useWallet } from "@/hooks/useWallet"

export function TrustStudio({
  freelancerOptions,
}: {
  freelancerOptions: FreelancerOption[]
}) {
  const [message, setMessage] = useState(
    "Urgent role. Move to WhatsApp so we can finish quickly. We need a small security deposit before onboarding.",
  )
  const deferredMessage = useDeferredValue(message)

  const [trustForm, setTrustForm] = useState({
    completionRate: 97,
    peerReviewAvg: 4.8,
    forumActivity: 16,
    responseTimeMin: 70,
    reportCount: 0,
  })
  const [escrowForm, setEscrowForm] = useState({
    amount: 4200,
    balance: 12000,
  })
  const [selectedFreelancerId, setSelectedFreelancerId] = useState(
    freelancerOptions[0]?.id ?? "",
  )
  const [recommendations, setRecommendations] = useState<RecommendedJob[]>([])
  const [recommendationError, setRecommendationError] = useState<string | null>(null)
  const [isRecommendationPending, startRecommendationTransition] = useTransition()

  const { checkContent, loading: scamLoading, error: scamError, result } = useRiskAnalysis()
  const {
    score,
    breakdown,
    fetchScore,
    loading: trustLoading,
    error: trustError,
  } = useTrustScore()
  const { lockEscrow, loading: escrowLoading, error: escrowError, lastEscrow } = useWallet()

  useEffect(() => {
    if (!selectedFreelancerId) {
      return
    }

    startRecommendationTransition(() => {
      void (async () => {
        setRecommendationError(null)

        try {
          const data = await apiRequest<RecommendedJob[]>(
            `/api/recommendation?userId=${encodeURIComponent(selectedFreelancerId)}`,
          )
          setRecommendations(data.slice(0, 4))
        } catch (caughtError) {
          setRecommendationError(
            caughtError instanceof Error
              ? caughtError.message
              : "Recommendations could not be loaded.",
          )
        }
      })()
    })
  }, [selectedFreelancerId])

  const scamWordCount = deferredMessage.trim()
    ? deferredMessage.trim().split(/\s+/).length
    : 0

  const handleTrustChange = (field: keyof typeof trustForm, value: string) => {
    setTrustForm((current) => ({
      ...current,
      [field]: Number(value),
    }))
  }

  const handleEscrowChange = (field: keyof typeof escrowForm, value: string) => {
    setEscrowForm((current) => ({
      ...current,
      [field]: Number(value),
    }))
  }

  const trustMetrics: TrustMetrics = {
    completionRate: trustForm.completionRate / 100,
    peerReviewAvg: trustForm.peerReviewAvg,
    forumActivity: trustForm.forumActivity,
    responseTimeMin: trustForm.responseTimeMin,
    reportCount: trustForm.reportCount,
  }

  return (
    <GlassCard glow className="p-0">
      <div className="border-b border-border/30 px-6 py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Live trust infrastructure
            </div>
            <h3 className="text-2xl font-bold text-foreground">Trust Studio</h3>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Run the marketplace core in one place: scan suspicious content, score delivery credibility,
              simulate escrow protection, and preview talent-job fit.
            </p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-background/40 px-4 py-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{scamWordCount}</span> words in the active content sample
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="scam" className="gap-6">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 lg:grid-cols-4">
            <TabsTrigger value="scam">Scam Scan</TabsTrigger>
            <TabsTrigger value="trust">Trust Score</TabsTrigger>
            <TabsTrigger value="escrow">Escrow</TabsTrigger>
            <TabsTrigger value="match">Matching</TabsTrigger>
          </TabsList>

          <TabsContent value="scam">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-foreground">
                  Message or job brief
                </label>
                <Textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="min-h-44"
                />
                <div className="flex items-center gap-3">
                  <Button onClick={() => void checkContent(message)} disabled={scamLoading}>
                    {scamLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Analyze risk
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Flags off-platform pressure, advance-fee requests, and credential theft patterns.
                  </span>
                </div>
                {scamError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {scamError}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border/30 bg-background/40 p-5">
                  <p className="text-sm font-semibold text-foreground">Risk decision</p>
                  {result ? (
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <RiskBadge level={result.level} />
                        <span className="text-2xl font-bold text-foreground">{result.score}/100</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{result.reason}</p>
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          Trigger phrases
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.flaggedPhrases.length > 0 ? (
                            result.flaggedPhrases.map((phrase) => (
                              <span
                                key={phrase}
                                className="rounded-full bg-secondary px-2.5 py-1 text-xs text-foreground"
                              >
                                {phrase}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No suspicious keywords matched.</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          Recommended actions
                        </p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {result.recommendedActions.map((action) => (
                            <li key={action} className="flex gap-2">
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Run a scan to see explainable risk signals and next actions.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trust">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Completion rate (%)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={trustForm.completionRate}
                    onChange={(event) => handleTrustChange("completionRate", event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Peer review average
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={5}
                    step="0.1"
                    value={trustForm.peerReviewAvg}
                    onChange={(event) => handleTrustChange("peerReviewAvg", event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Community activity
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={trustForm.forumActivity}
                    onChange={(event) => handleTrustChange("forumActivity", event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Response time (minutes)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={10080}
                    value={trustForm.responseTimeMin}
                    onChange={(event) => handleTrustChange("responseTimeMin", event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Report count
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    value={trustForm.reportCount}
                    onChange={(event) => handleTrustChange("reportCount", event.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={() => void fetchScore(trustMetrics)} disabled={trustLoading}>
                    {trustLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Recalculate trust
                  </Button>
                </div>
                {trustError && (
                  <div className="sm:col-span-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {trustError}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-border/30 bg-background/40 p-5">
                {score !== null ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Trust snapshot</p>
                        <p className="text-sm text-muted-foreground">
                          Explainable credibility, not a black box score.
                        </p>
                      </div>
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex justify-center">
                      <TrustMeter score={score} size="md" />
                    </div>
                    {breakdown && (
                      <>
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Strengths
                          </p>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            {breakdown.drivers.map((driver) => (
                              <li key={driver} className="flex gap-2">
                                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                <span>{driver}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {breakdown.cautions.length > 0 && (
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                              Watchouts
                            </p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              {breakdown.cautions.map((caution) => (
                                <li key={caution} className="flex gap-2">
                                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                                  <span>{caution}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Adjust the inputs and calculate a score to see the trust breakdown.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="escrow">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Wallet balance (K)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={escrowForm.balance}
                    onChange={(event) => handleEscrowChange("balance", event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Escrow hold amount (K)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={escrowForm.amount}
                    onChange={(event) => handleEscrowChange("amount", event.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-3">
                  <Button
                    onClick={() => void lockEscrow(escrowForm.amount, escrowForm.balance)}
                    disabled={escrowLoading}
                  >
                    {escrowLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Simulate escrow lock
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Enforces positive amounts, sufficient balance, and explicit release visibility.
                  </span>
                </div>
                {escrowError && (
                  <div className="sm:col-span-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {escrowError}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-border/30 bg-background/40 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Escrow state</p>
                    <p className="text-sm text-muted-foreground">
                      Safer hiring starts with visible payout control.
                    </p>
                  </div>
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                {lastEscrow ? (
                  <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3">
                      <span>Status</span>
                      <span className="font-semibold text-foreground">{lastEscrow.escrowStatus}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3">
                      <span>Hold reference</span>
                      <span className="font-semibold text-foreground">{lastEscrow.holdReference}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3">
                      <span>Remaining balance</span>
                      <span className="font-semibold text-foreground">
                        K{lastEscrow.newBalance.toLocaleString()}
                      </span>
                    </div>
                    <p>{lastEscrow.releaseEta}</p>
                    <p className="text-foreground">{lastEscrow.message}</p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Run the simulation to see how balance protection and hold references behave.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="match">
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Talent to job fit</p>
                  <p className="text-sm text-muted-foreground">
                    Ranking considers skills, delivery context, and trust readiness.
                  </p>
                </div>
                <select
                  value={selectedFreelancerId}
                  onChange={(event) => setSelectedFreelancerId(event.target.value)}
                  className="h-10 rounded-md border border-border bg-transparent px-3 text-sm text-foreground"
                >
                  {freelancerOptions.map((freelancer) => (
                    <option key={freelancer.id} value={freelancer.id} className="bg-background">
                      {freelancer.name} · {freelancer.location}
                    </option>
                  ))}
                </select>
              </div>

              {recommendationError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {recommendationError}
                </div>
              )}

              <div className="grid gap-4 lg:grid-cols-2">
                {isRecommendationPending ? (
                  <div className="col-span-full flex items-center gap-2 text-sm text-muted-foreground">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Loading recommendations...
                  </div>
                ) : (
                  recommendations.map((job) => (
                    <motion.div
                      key={job.id}
                      className="rounded-2xl border border-border/30 bg-background/40 p-5"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{job.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {job.company} · K{job.budgetMin.toLocaleString()} - K
                            {job.budgetMax.toLocaleString()}
                          </p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          {job.matchScore}% fit
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.reasons.map((reason) => (
                          <span
                            key={reason}
                            className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-foreground"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </GlassCard>
  )
}
