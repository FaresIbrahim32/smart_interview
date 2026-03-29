"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Mic, ScanSearch, Upload, Video } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AnimatedCard } from "@/components/ui/animated-card";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [hasResume, setHasResume] = useState(false);
  const [language, setLanguage] = useState<string>("english");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setUserName(user.user_metadata?.full_name ?? user.email ?? null);

      const chunks = localStorage.getItem("interview_chunks");
      const lang = localStorage.getItem("interview_language") || "english";
      setHasResume(Boolean(chunks));
      setLanguage(lang);
    });
  }, [router]);

  const languageLabel: Record<string, string> = {
    english: "English voice session",
    spanish: "Spanish voice session",
    asl: "ASL camera session",
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[32px] border border-white/10 bg-[#0d141b] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
          <div className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-emerald-100">
            Dashboard
          </div>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            Welcome{userName ? `, ${userName}` : ""}. Your interview prep studio is ready.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-400">
            Move from resume upload to screening and guided mock interviews without
            leaving the same visual flow.
          </p>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm font-medium text-slate-200">Current setup</p>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-white/8 bg-[#0b1117] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Resume</p>
              <p className="mt-2 text-lg font-medium text-white">
                {hasResume ? "Uploaded and ready" : "Not uploaded yet"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-[#0b1117] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Language mode</p>
              <p className="mt-2 text-lg font-medium text-white">
                {languageLabel[language] ?? language}
              </p>
            </div>
          </div>
        </div>
      </section>

      {!hasResume && (
        <AnimatedCard
          delay={0.1}
          className="rounded-[32px] border-white/10 bg-[#0d141b] shadow-[0_24px_80px_rgba(0,0,0,0.32)]"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Upload className="h-5 w-5 text-emerald-300" />
              Upload your resume
            </CardTitle>
            <CardDescription className="text-base leading-7 text-slate-400">
              Add your PDF so the platform can generate personalized questions and
              screening insights around your actual experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="h-12 rounded-2xl bg-emerald-400 px-6 text-base font-semibold text-[#092014] hover:bg-emerald-300"
              onClick={() => router.push("/setup")}
            >
              Upload Resume and Continue
            </Button>
          </CardContent>
        </AnimatedCard>
      )}

      {hasResume && (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: FileText,
                title: "Resume",
                value: "Loaded into session memory",
                detail: "Your current resume data is available for prompts.",
              },
              {
                icon: language === "asl" ? Video : Mic,
                title: "Practice mode",
                value: languageLabel[language] ?? language,
                detail: "You can switch this anytime in setup.",
              },
              {
                icon: ScanSearch,
                title: "Screening",
                value: "Ready to analyze",
                detail: "Run the resume screener for category and role fit.",
              },
              {
                icon: Upload,
                title: "Resume refresh",
                value: "One-click reset",
                detail: "Upload a revised version whenever you want.",
              },
            ].map((item, index) => (
              <AnimatedCard
                key={item.title}
                delay={0.1 + index * 0.08}
                className="rounded-[28px] border-white/10 bg-[#0d141b]"
              >
                <CardHeader className="space-y-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-300/12 text-emerald-200">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                    <p className="mt-2 text-base font-medium text-slate-200">{item.value}</p>
                  </div>
                  <CardDescription className="leading-7 text-slate-400">
                    {item.detail}
                  </CardDescription>
                </CardHeader>
              </AnimatedCard>
            ))}
          </section>

          <AnimatedCard
            delay={0.38}
            className="rounded-[32px] border-white/10 bg-[#0d141b] shadow-[0_24px_80px_rgba(0,0,0,0.32)]"
          >
            <CardHeader>
              <CardTitle className="text-white">Choose your next step</CardTitle>
              <CardDescription className="text-base leading-7 text-slate-400">
                Go straight into a mock interview, run the screener, or adjust the
                resume and language setup that powers both.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <Button
                size="lg"
                className="h-12 rounded-2xl bg-emerald-400 text-base font-semibold text-[#092014] hover:bg-emerald-300"
                onClick={() => router.push("/interview")}
              >
                {language === "asl" ? (
                  <>
                    <Video className="mr-2 h-5 w-5" />
                    Start ASL Interview
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5" />
                    Start Interview
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-2xl border-white/10 bg-transparent text-slate-100 hover:bg-white/5"
                onClick={() => router.push("/screen")}
              >
                <ScanSearch className="mr-2 h-5 w-5" />
                Screen My Resume
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-2xl border-white/10 bg-transparent text-slate-100 hover:bg-white/5"
                onClick={() => router.push("/setup")}
              >
                Re-upload Resume
              </Button>
            </CardContent>
          </AnimatedCard>
        </>
      )}
    </div>
  );
}
