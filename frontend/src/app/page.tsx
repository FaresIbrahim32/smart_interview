"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Mic, ScanSearch, Sparkles, Video } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

const productFlows = [
  {
    icon: FileText,
    title: "Upload your resume",
    copy: "Add a PDF so the app can generate questions from your actual background.",
  },
  {
    icon: ScanSearch,
    title: "Screen the resume",
    copy: "Run the screener to get category, recommended role, and extracted details.",
  },
  {
    icon: Mic,
    title: "Start a mock interview",
    copy: "Practice technical and behavioral prompts with voice support.",
  },
  {
    icon: Video,
    title: "Use ASL mode",
    copy: "Turn on the camera when you want to practice in ASL mode.",
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
    <main className="app-shell">
      <div className="app-container">
        <FadeIn>
          <header className="app-header flex flex-col gap-5 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="app-panel-soft flex h-12 w-12 items-center justify-center rounded-2xl">
                <Sparkles className="h-5 w-5 app-text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight app-text-primary">
                  smart interview
                </p>
                <p className="text-sm app-text-muted">
                  Resume-based interview practice with screening and ASL support.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="outline" className="app-secondary-button h-11 rounded-2xl px-5">
                  Log In
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

        <section className="grid flex-1 gap-8 py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <FadeIn delay={0.08}>
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm app-chip">
                <span className="h-2 w-2 rounded-full bg-current" />
                Built around the routes that exist in the app today
              </div>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] app-text-primary sm:text-6xl lg:text-7xl">
                  Practice your next interview with the same data you&apos;ll use in the app.
                </h1>
                <p className="max-w-3xl text-lg leading-8 app-text-muted sm:text-xl">
                  Upload a resume, screen it, and run technical or behavioral mock
                  interviews with voice and ASL-friendly options.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
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
                    Continue to Login
                  </Button>
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {productFlows.map((item, index) => (
                  <motion.article
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 + index * 0.08 }}
                    className="app-panel rounded-[28px] p-5"
                  >
                    <div className="app-panel-soft mb-4 flex h-11 w-11 items-center justify-center rounded-2xl">
                      <item.icon className="h-5 w-5 app-text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold app-text-primary">{item.title}</h2>
                    <p className="mt-2 text-sm leading-7 app-text-muted">{item.copy}</p>
                  </motion.article>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.16}>
            <aside className="app-panel rounded-[32px] p-6">
              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] app-text-muted">
                    Available routes
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold leading-tight app-text-primary">
                    Move straight into the built product flows.
                  </h2>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Authentication", href: "/login" },
                    { label: "Resume setup", href: "/setup" },
                    { label: "Resume screening", href: "/screen" },
                    { label: "Interview session", href: "/interview" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="app-panel-soft flex items-center justify-between rounded-[24px] px-4 py-4 transition hover:opacity-90"
                    >
                      <span className="font-medium app-text-primary">{item.label}</span>
                      <ArrowRight className="h-4 w-4 app-text-muted" />
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </FadeIn>
        </section>
      </div>
    </main>
  );
}
