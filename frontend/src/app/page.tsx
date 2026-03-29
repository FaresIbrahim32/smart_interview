"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Mic, ScanSearch, Sparkles, Video } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

const productFlows = [
  {
    icon: FileText,
    title: "Upload your resume",
    copy: "Add a PDF so Smart Interview can tailor the session to your background.",
  },
  {
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
              <div className="space-y-1">
                <p className="text-2xl font-semibold tracking-tight app-text-primary">
                  smart interview
                </p>
                <p className="text-sm app-text-muted">
                  Resume-based interview practice with screening and ASL support.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-start gap-3 lg:justify-end">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="outline" className="app-secondary-button h-11 rounded-2xl px-5">
                  Log In
                </Button>
              </Link>
            </div>
          </header>
        </FadeIn>

        <section className="grid flex-1 gap-10 py-16 lg:grid-cols-[minmax(0,1.1fr)_360px] lg:items-start">
          <FadeIn delay={0.08}>
            <div className="space-y-10">
              <div className="space-y-6 text-left">
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm app-chip">
                  <span className="h-2 w-2 rounded-full bg-current" />
                  Built around the product routes that already work
                </div>

                <div className="max-w-3xl space-y-4">
                  <h1 className="text-5xl font-semibold leading-[0.98] tracking-[-0.04em] app-text-primary sm:text-6xl lg:text-7xl">
                    Get ready for interviews with one clear workflow.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 app-text-muted sm:text-xl">
                    Upload your resume, review the screening results, and practice your
                    answers in the same app.
                  </p>
                </div>
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
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {productFlows.map((item, index) => (
                  <motion.article
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 + index * 0.08 }}
                    className="app-panel rounded-[28px] p-6"
                  >
                    <div className="app-panel-soft mb-5 flex h-11 w-11 items-center justify-center rounded-2xl">
                      <item.icon className="h-5 w-5 app-text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-lg font-semibold app-text-primary">{item.title}</h2>
                      <p className="text-sm leading-7 app-text-muted">{item.copy}</p>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.16}>
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
                    >
                      Log In
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
