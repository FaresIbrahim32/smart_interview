"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Headphones,
  MessageSquareText,
  Sparkles,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sponsors = ["Resume AI", "Pitch", "Loop", "Sign", "Coach"];

const highlights = [
  "Resume-based interview prep",
  "Voice and text coaching",
  "ASL-aware accessibility",
];

const interviewCards = [
  {
    label: "Most Popular",
    company: "Frontend Engineer",
    accent: "from-emerald-400/30 via-emerald-200/10 to-transparent",
    description: "UI architecture, accessibility, and React system design prompts.",
  },
  {
    label: "Behavioral",
    company: "Product Manager",
    accent: "from-cyan-400/30 via-sky-200/10 to-transparent",
    description: "Leadership stories, tradeoffs, prioritization, and stakeholder scenarios.",
  },
  {
    label: "ASL Ready",
    company: "Support Specialist",
    accent: "from-amber-300/30 via-orange-200/10 to-transparent",
    description: "Inclusive interview practice with signing and speech-friendly flows.",
  },
];

function FadeIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a1016] text-slate-50">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,_rgba(87,225,164,0.14),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(56,189,248,0.10),_transparent_24%),linear-gradient(180deg,_#0c1218_0%,_#091017_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-12 pt-6 sm:px-8 lg:px-10">
        <FadeIn>
          <header className="flex flex-col gap-5 border-b border-white/8 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                <Sparkles className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight">smart interview</p>
                <p className="text-sm text-slate-400">
                  Practice with AI before the real conversation.
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-200">
                2,943 mock sessions
              </span>
              <span className="px-2 py-1">Resume-based</span>
              <span className="px-2 py-1">Voice feedback</span>
              <span className="px-2 py-1">ASL support</span>
              <Link href="/signup">
                <Button className="h-11 rounded-2xl bg-emerald-400 px-5 text-[#092014] hover:bg-emerald-300">
                  Start Free
                </Button>
              </Link>
            </nav>
          </header>
        </FadeIn>

        <section className="grid flex-1 gap-14 py-12 lg:grid-cols-[minmax(0,1.15fr)_380px] lg:items-start">
          <FadeIn delay={0.08}>
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Personalized interview prep for technical and behavioral roles
                </div>

                <div className="max-w-4xl space-y-5">
                  <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
                    The smartest way to rehearse your next interview.
                  </h1>
                  <p className="max-w-3xl text-lg leading-8 text-slate-400 sm:text-xl">
                    Upload your resume, choose a role, and get realistic questions with
                    instant coaching across text, voice, and ASL-friendly practice
                    sessions.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                  <span>Trusted by students and early-career candidates:</span>
                  {sponsors.map((sponsor) => (
                    <div
                      key={sponsor}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-slate-200"
                    >
                      {sponsor}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[28px] border border-white/10 bg-[#0d141b] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Core capabilities
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {highlights.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-3">
                  {interviewCards.map((card, index) => (
                    <motion.article
                      key={card.company}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                      whileHover={{ y: -6 }}
                      className="group overflow-hidden rounded-[28px] border border-white/10 bg-[#0d141b] shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
                    >
                      <div className="border-b border-white/8 px-5 py-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                          </div>
                          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-200">
                            {card.label}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4 p-5">
                        <div className="rounded-2xl border border-white/8 bg-[#080d12] px-4 py-3 text-center text-sm text-slate-300">
                          {card.company}
                        </div>
                        <div
                          className={`h-44 rounded-[22px] border border-white/8 bg-gradient-to-b ${card.accent} p-5`}
                        >
                          <div className="flex h-full flex-col justify-between rounded-[18px] border border-white/10 bg-[#0a1015]/90 p-5">
                            <div className="space-y-3">
                              <div className="h-2 w-20 rounded-full bg-white/15" />
                              <div className="h-2 w-32 rounded-full bg-white/10" />
                              <div className="h-16 rounded-2xl bg-white/[0.04]" />
                            </div>
                            <p className="text-sm leading-6 text-slate-400">
                              {card.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.16}>
            <aside className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0d141b] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.45)]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_45%),radial-gradient(circle_at_top_right,rgba(74,222,128,0.14),transparent_26%)]" />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
                  <span>Weekly Prep Brief</span>
                  <span>2,418+ learners</span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-semibold leading-tight text-white">
                    Get guided interview practice in your inbox each week.
                  </h2>
                  <p className="text-base leading-7 text-slate-400">
                    Join candidates getting role-specific prompts, answer frameworks,
                    and confidence-building tips before interview day.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs leading-6 text-slate-500">
                    Weekly prep brief coming soon. For now, create an account to start
                    a real practice session immediately.
                  </p>
                </div>

                <div className="grid gap-3 pt-2">
                  {[
                    {
                      icon: MessageSquareText,
                      title: "Mock interviews",
                      copy: "Targeted prompts based on your resume and desired role.",
                    },
                    {
                      icon: Headphones,
                      title: "Voice feedback",
                      copy: "Hear pacing, filler-word, and clarity coaching after each answer.",
                    },
                    {
                      icon: Video,
                      title: "Accessible practice",
                      copy: "Train with text, speech, and ASL-aware experiences in one flow.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/12 text-emerald-200">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{item.copy}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="h-11 rounded-2xl border-white/10 bg-transparent px-5 text-slate-100 hover:bg-white/5"
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="h-11 rounded-2xl bg-white px-5 text-slate-950 hover:bg-slate-200">
                      Build My Session <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </aside>
          </FadeIn>
        </section>
      </div>
    </main>
  );
}
