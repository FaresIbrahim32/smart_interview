"use client";

import Link from "next/link";
import { motion } from "framer-motion";
<<<<<<< HEAD
import {
  ArrowRight,
  CheckCircle2,
  Headphones,
  MessageSquareText,
  Sparkles,
  Video,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const interviewCards = [
=======
import { FileText, Mic, ScanSearch, Sparkles, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

const productFlows = [
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
  {
    icon: FileText,
    title: "Upload your resume",
    copy: "Add a PDF so Smart Interview can tailor the session to your background.",
  },
  {
<<<<<<< HEAD
    label: "Behavioral",
    company: "Product Manager",
    accent: "from-lime-400/30 via-emerald-200/10 to-transparent",
    description: "Leadership stories, tradeoffs, prioritization, and stakeholder scenarios.",
  },
  {
    label: "ASL Ready",
    company: "Support Specialist",
    accent: "from-green-400/30 via-lime-200/10 to-transparent",
    description: "Inclusive interview practice with signing and speech-friendly flows.",
=======
    icon: ScanSearch,
    title: "Review your resume",
    copy: "See the role match, extracted details, and other screening results.",
  },
  {
    icon: Mic,
    title: "Practice answers",
    copy: "Work through technical and behavioral questions with voice support.",
  },
  {
    icon: Video,
    title: "Use ASL mode",
    copy: "Turn on the camera when you want to practice in ASL.",
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
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
<<<<<<< HEAD
    <main className="min-h-screen text-foreground">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-14 pt-6 sm:px-8 lg:px-10">
        <FadeIn>
          <header className="flex flex-col gap-5 border-b border-border/70 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-card/80 shadow-sm">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight">smart interview</p>
                <p className="text-sm text-muted-foreground">
                  Practice with AI before the real conversation.
=======
    <main className="app-shell">
      <div className="app-container">
        <FadeIn>
          <header className="app-header flex flex-col gap-5 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="app-panel-soft flex h-12 w-12 items-center justify-center rounded-2xl">
                <Sparkles className="h-5 w-5 app-text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold tracking-tight app-text-primary">
                  smart interview
                </p>
                <p className="text-sm app-text-muted">
                  Resume-based interview practice with screening and ASL support.
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
                </p>
              </div>
            </div>

<<<<<<< HEAD
            <nav className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-medium text-primary">
                Resume-driven practice
              </span>
              <ThemeToggle />
              <Link href="/signup">
                <Button className="h-11 rounded-2xl bg-primary px-5 text-primary-foreground hover:bg-primary/90">
                  Start Free
=======
            <div className="flex items-center justify-start gap-3 lg:justify-end">
              <Link href="/login">
                <Button variant="outline" className="app-secondary-button h-11 rounded-2xl px-5">
                  Log In
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="app-primary-button h-11 rounded-2xl px-5">
                  Get Started
                </Button>
              </Link>
            </div>
          </header>
        </FadeIn>

<<<<<<< HEAD
        <section className="grid flex-1 gap-12 py-12 lg:grid-cols-[minmax(0,1.15fr)_360px] lg:items-start">
          <FadeIn delay={0.08}>
            <div className="space-y-8">
              <div className="space-y-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-sm text-foreground/80">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Personalized interview prep for technical and behavioral roles
                </div>

                <div className="max-w-4xl space-y-5">
                  <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
                    The smartest way to rehearse your next interview.
                  </h1>
                  <p className="max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
                    Upload your resume, choose a role, and get realistic questions with
                    instant coaching across text, voice, and ASL-friendly practice
                    sessions.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    "Resume-based questions tailored to your actual experience",
                    "Voice, text, and ASL-friendly practice in one flow",
                    "Fast switch from setup to screening to mock interviews",
                  ].map((item) => (
                    <div
                      key={item}
                      className="panel-soft rounded-[24px] p-4 text-sm leading-6 text-muted-foreground"
                    >
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      {item}
                    </div>
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
                    className="panel-surface group overflow-hidden rounded-[28px]"
                  >
                    <div className="border-b border-border/70 px-5 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-primary/50" />
                          <span className="h-2.5 w-2.5 rounded-full bg-border" />
                          <span className="h-2.5 w-2.5 rounded-full bg-border" />
                        </div>
                        <span className="rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary">
                          {card.label}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4 p-5">
                      <div className="rounded-2xl border border-border/60 bg-secondary/70 px-4 py-3 text-center text-sm text-foreground/80">
                        {card.company}
                      </div>
                      <div
                        className={`h-44 rounded-[22px] border border-border/60 bg-gradient-to-b ${card.accent} p-5`}
                      >
                        <div className="flex h-full flex-col justify-between rounded-[18px] border border-border/60 bg-background/90 p-5">
                          <div className="space-y-3">
                            <div className="h-2 w-20 rounded-full bg-primary/25" />
                            <div className="h-2 w-32 rounded-full bg-primary/15" />
                            <div className="h-16 rounded-2xl bg-secondary/75" />
                          </div>
                          <p className="text-sm leading-6 text-muted-foreground">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
=======
        <section className="grid gap-10 py-16 lg:grid-cols-[minmax(0,1.1fr)_360px] lg:items-start">
          <FadeIn delay={0.08}>
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm app-chip">
                <span className="h-2 w-2 rounded-full bg-current" />
                Built around the product routes that already work
              </div>

              <div className="max-w-3xl space-y-4 text-left">
                <h1 className="text-5xl font-semibold leading-[0.98] tracking-[-0.04em] app-text-primary sm:text-6xl lg:text-7xl">
                  Get ready for interviews with one clear workflow.
                </h1>
                <p className="max-w-2xl text-lg leading-8 app-text-muted sm:text-xl">
                  Upload your resume, review the screening results, and practice your
                  answers in the same app.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-start gap-3">
                <Link href="/signup">
                  <Button className="app-primary-button h-12 rounded-2xl px-6 text-base font-semibold">
                    Create Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="app-secondary-button h-12 rounded-2xl px-6 text-base"
                  >
                    Continue
                  </Button>
                </Link>
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.16}>
<<<<<<< HEAD
            <aside className="panel-surface relative overflow-hidden rounded-[32px] p-6">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,197,94,0.08),transparent_45%),radial-gradient(circle_at_top_right,rgba(187,247,208,0.22),transparent_28%)]" />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <span>Practice flow</span>
                  <span>Live today</span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-semibold leading-tight text-foreground">
                    Start with setup, then move straight into screening and mock interviews.
                  </h2>
                  <p className="text-base leading-7 text-muted-foreground">
                    The product already supports resume upload, role-aware prompts, and
                    accessible practice, so this panel points only to real paths users can take.
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
                      className="rounded-2xl border border-border/60 bg-background/55 p-4"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.copy}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="h-11 rounded-2xl border-border/70 bg-transparent px-5 text-foreground hover:bg-accent"
=======
            <aside className="app-panel rounded-[32px] p-8">
              <div className="space-y-8 text-center lg:text-left">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.24em] app-text-muted">
                    Start Here
                  </p>
                  <h2 className="text-3xl font-semibold leading-tight app-text-primary">
                    Pick up the flow at the point you need.
                  </h2>
                  <p className="text-sm leading-7 app-text-muted">
                    New users can create an account. Returning users can log in and continue.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Link href="/signup">
                    <Button className="app-primary-button h-12 w-full rounded-2xl text-base font-semibold">
                      Create Account
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="app-secondary-button h-12 w-full rounded-2xl text-base"
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
                    >
                      Log In
                    </Button>
                  </Link>
<<<<<<< HEAD
                  <Link href="/signup">
                    <Button className="h-11 rounded-2xl bg-primary px-5 text-primary-foreground hover:bg-primary/90">
                      Build My Session <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
=======
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
                </div>
              </div>
            </aside>
          </FadeIn>
        </section>

        <FadeIn delay={0.22}>
          <section className="mx-auto flex w-full max-w-6xl justify-center pb-16">
            <div className="grid w-full gap-5 md:grid-cols-2">
              {productFlows.map((item, index) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.18 + index * 0.08 }}
                  className="app-panel rounded-[28px] p-8"
                >
                  <div className="app-panel-soft mb-6 flex h-14 w-14 items-center justify-center rounded-2xl">
                    <item.icon className="h-5 w-5 app-text-primary" />
                  </div>
                  <div className="max-w-md space-y-3 text-left">
                    <h2 className="text-lg font-semibold app-text-primary">{item.title}</h2>
                    <p className="text-sm leading-7 app-text-muted">{item.copy}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        </FadeIn>
      </div>
    </main>
  );
}
