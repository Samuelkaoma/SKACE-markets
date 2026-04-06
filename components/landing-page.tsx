"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  Activity,
  ArrowRight,
  Brain,
  Briefcase,
  Lock,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react"

import { GlassCard } from "@/components/glass-card"
import { LandingNav } from "@/components/landing-nav"
import { ParticleBackground } from "@/components/particle-background"
import { TrustStudio } from "@/components/trust-studio"
import type { HomeOverview } from "@/lib/server/dashboard-service"
import type { FreelancerOption } from "@/lib/server/marketplace-repository"

const features = [
  {
    icon: Brain,
    title: "Explainable trust scoring",
    description:
      "Turn noisy delivery behavior into transparent trust signals that employers can actually use.",
  },
  {
    icon: ShieldCheck,
    title: "Scam and anomaly defense",
    description:
      "Combine phrase detection, operational playbooks, and burst-behavior monitoring before fraud compounds.",
  },
  {
    icon: Lock,
    title: "Escrow-first confidence",
    description:
      "Model protected payouts, release conditions, and dispute visibility as a core product surface, not an afterthought.",
  },
  {
    icon: TrendingUp,
    title: "Role-specific intelligence",
    description:
      "Freelancers, employers, and platform operators each get a focused command surface with shared data underneath.",
  },
]

const roleCards = [
  {
    href: "/auth",
    title: "Freelancer Dashboard",
    description: "See trust momentum, earnings readiness, and best-fit work in one place.",
    icon: Users,
  },
  {
    href: "/auth",
    title: "Employer Dashboard",
    description: "Shortlist safer talent faster with conversion funnels and applicant trust visibility.",
    icon: Briefcase,
  },
  {
    href: "/auth",
    title: "Admin Dashboard",
    description: "Monitor platform health, suspicious behavior, and trust adoption across the marketplace.",
    icon: Activity,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function LandingPage({
  overview,
  freelancerOptions,
}: {
  overview: HomeOverview
  freelancerOptions: FreelancerOption[]
}) {
  return (
    <div className="animated-gradient relative min-h-screen overflow-hidden">
      <ParticleBackground />
      <LandingNav />

      <section className="relative z-10 flex min-h-screen items-center px-6 pt-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Trust infrastructure for Zambia-first freelance work
              </div>
            </motion.div>

            <motion.h1
              className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-7xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Hire with confidence.
              <span className="text-primary text-glow"> Pay with protection.</span>
              <br />
              Grow a trusted market.
            </motion.h1>

            <motion.p
              className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              SKACE Markets turns credibility, scam defense, and escrow confidence into one
              cohesive product. Instead of a generic freelance board, you get a marketplace
              operating system built around trust.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Link
                href="/auth"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 glow-cyan"
              >
                Enter the marketplace
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#trust-studio"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Explore trust studio
              </a>
            </motion.div>
          </div>

          <motion.div
            className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            {overview.stats.map((stat) => (
              <GlassCard key={stat.label} className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
                  {stat.label}
                </p>
                <p className="mt-3 text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.detail}</p>
              </GlassCard>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="trust-studio" className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="mb-10 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-primary">Interactive Core</span>
            <h2 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-4xl">
              The core product works in one surface
            </h2>
            <p className="mt-4 text-muted-foreground">
              This is the production-grade vertical slice: validated backend inputs, modular
              services, and a frontend that turns safety and trust into visible user value.
            </p>
          </motion.div>

          <TrustStudio freelancerOptions={freelancerOptions} />
        </div>
      </section>

      <section id="signals" className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-primary">Signal Design</span>
            <h2 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-4xl">
              High-signal product design, not dashboard theater
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Every module is built around high cohesion, lower coupling, and clear product
              outcomes so the trust layer can scale without becoming brittle.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <GlassCard className="h-full">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {overview.operatingPrinciples.map((principle) => (
              <GlassCard key={principle.title} className="h-full">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
                  {principle.metric}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-foreground">{principle.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{principle.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <GlassCard>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Featured talent</p>
                <p className="text-sm text-muted-foreground">
                  Specialists whose trust history is already visible to buyers.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {overview.featuredFreelancers.map((freelancer) => (
                <div key={freelancer.id} className="rounded-2xl bg-secondary/30 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{freelancer.name}</p>
                      <p className="text-sm text-muted-foreground">{freelancer.headline}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {freelancer.location} · {freelancer.availability}
                      </p>
                    </div>
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {freelancer.trustScore}/100
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {freelancer.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-background/60 px-2.5 py-1 text-[11px] text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Featured work</p>
                <p className="text-sm text-muted-foreground">
                  Roles where trust, fit, and payout protection matter immediately.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {overview.featuredJobs.map((job) => (
                <div key={job.id} className="rounded-2xl bg-secondary/30 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{job.title}</p>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{job.location}</p>
                    </div>
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {job.budget}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-background/60 px-2.5 py-1 text-[11px] text-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      <section id="dashboards" className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-primary">Role-Specific Views</span>
            <h2 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-4xl">
              One product, three clear operating modes
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              This is where modular design pays off. Shared services feed distinct interfaces instead
              of each dashboard becoming a disconnected one-off.
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {roleCards.map((role) => (
              <GlassCard key={role.title} className="h-full">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                  <role.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{role.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{role.description}</p>
                <Link
                  href={role.href}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary"
                >
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/40 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
              <Activity className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">SKACE Markets</span>
            <span className="text-sm text-muted-foreground">
              Production-grade trust layer for modern freelance work
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Zambia-first hiring intelligence, scam defense, and escrow confidence
          </div>
        </div>
      </footer>
    </div>
  )
}
