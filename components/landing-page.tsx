"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  ShieldCheck,
  Brain,
  TrendingUp,
  Eye,
  Lock,
  Zap,
  ArrowRight,
  CheckCircle2,
  Activity,
} from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { ParticleBackground } from "@/components/particle-background"
import { LandingNav } from "@/components/landing-nav"

const features = [
  {
    icon: Brain,
    title: "AI Scam Detection",
    description:
      "Advanced machine learning models analyze behavioral patterns to detect fraudulent actors in real-time.",
  },
  {
    icon: ShieldCheck,
    title: "Credibility Scoring",
    description:
      "Dynamic trust scores calculated from verified work history, peer reviews, and on-platform behavior.",
  },
  {
    icon: Eye,
    title: "Risk Intelligence",
    description:
      "Predictive risk assessment powered by multi-layer neural networks and historical fraud data.",
  },
  {
    icon: TrendingUp,
    title: "Trust Analytics",
    description:
      "Comprehensive dashboards visualizing platform-wide trust metrics and fraud trends.",
  },
  {
    icon: Lock,
    title: "Secure Exchange",
    description:
      "End-to-end encrypted transactions with smart escrow and dispute resolution protocols.",
  },
  {
    icon: Zap,
    title: "Instant Verification",
    description:
      "Real-time identity and skills verification using AI-powered document and portfolio analysis.",
  },
]

const steps = [
  {
    step: "01",
    title: "Profile Analysis",
    description:
      "Our AI engine ingests and analyzes freelancer profiles, work history, and behavioral signals.",
  },
  {
    step: "02",
    title: "Trust Score Generation",
    description:
      "Multi-dimensional credibility scores are generated from verified data points and peer feedback.",
  },
  {
    step: "03",
    title: "Risk Assessment",
    description:
      "Continuous monitoring flags anomalies and provides risk probability for every interaction.",
  },
  {
    step: "04",
    title: "Secure Marketplace",
    description:
      "Employers make informed hiring decisions with transparent trust scores and risk indicators.",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function LandingPage() {
  return (
    <div className="animated-gradient relative min-h-screen overflow-hidden">
      <ParticleBackground />
      <LandingNav />

      {/* Hero */}
      <section className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-20">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Activity className="h-3.5 w-3.5" />
              AI-Powered Trust Engine
            </div>
          </motion.div>

          <motion.h1
            className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-7xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            Build Trust.{" "}
            <span className="text-primary text-glow">Detect Fraud.</span>
            <br />
            Exchange with Confidence.
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            SKACE Markets combines advanced AI scam detection with a powerful
            credibility engine to create the most trusted freelance marketplace
            platform.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
          >
            <Link
              href="/dashboard/freelancer"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 glow-cyan"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              View Admin Demo
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {[
              "99.7% Fraud Detection Rate",
              "50K+ Verified Freelancers",
              "Real-time Risk Assessment",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-primary">Features</span>
            <h2 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-4xl">
              Enterprise-Grade Trust Infrastructure
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              A comprehensive suite of AI-powered tools designed to establish,
              maintain, and verify credibility across your marketplace.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-primary">
              How It Works
            </span>
            <h2 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-4xl">
              From Data to Trust in Four Steps
            </h2>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2">
            {steps.map((step, idx) => (
              <motion.div
                key={step.step}
                className="flex gap-4"
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                  {step.step}
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Engine CTA */}
      <section id="trust" className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <GlassCard glow className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-balance text-3xl font-bold text-foreground">
                Ready to Build Trust?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                Join thousands of freelancers and employers who trust SKACE
                Markets for secure, transparent marketplace interactions.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/dashboard/freelancer"
                  className="group inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                >
                  Freelancer Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/dashboard/employer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  Employer Dashboard
                </Link>
              </div>
            </motion.div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
              <Activity className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              SKACE Markets
            </span>
            <span className="text-sm text-muted-foreground">
              — Built by Samuel Kaoma
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Contact: 0762112817
          </div>
        </div>
      </footer>
    </div>
  )
}
