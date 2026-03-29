"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Mic, ScanSearch, Video } from "lucide-react";
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
    english: "English voice",
    spanish: "Spanish voice",
    asl: "ASL camera",
  };

  const nextStepLabel = hasResume ? "Start interview" : "Upload resume";

  return (
    <div className="space-y-10">
      <section className="app-panel rounded-[32px] p-8 lg:p-10">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] app-text-primary sm:text-5xl">
            Welcome{userName ? `, ${userName}` : ""}.
          </h1>
          <p className="text-lg leading-8 app-text-muted">
            This is your main workspace for uploading a resume, reviewing screening
            results, and starting practice sessions.
          </p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[
          {
            icon: FileText,
            title: "Resume status",
            value: hasResume ? "Uploaded" : "Not uploaded",
            detail: hasResume ? "Your resume is ready to use." : "Upload a PDF to continue.",
          },
          {
            icon: language === "asl" ? Video : Mic,
            title: "Interview mode",
            value: languageLabel[language] ?? language,
            detail: "This setting is used in the interview session.",
          },
          {
            icon: ScanSearch,
            title: "Next recommended step",
            value: hasResume ? "Practice or review screening" : "Complete setup",
            detail: hasResume
              ? "You can screen your resume or start the interview."
              : "Upload a resume and choose your language first.",
          },
        ].map((item, index) => (
          <AnimatedCard
            key={item.title}
            delay={0.08 + index * 0.06}
            className="app-panel rounded-[28px]"
          >
            <CardHeader className="space-y-4">
              <div className="app-panel-soft flex h-11 w-11 items-center justify-center rounded-2xl">
                <item.icon className="h-5 w-5 app-text-primary" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-lg app-text-primary">{item.title}</CardTitle>
                <p className="text-base font-medium app-text-secondary">{item.value}</p>
              </div>
              <CardDescription className="leading-7 app-text-muted">
                {item.detail}
              </CardDescription>
            </CardHeader>
          </AnimatedCard>
        ))}
      </section>

      <section className="flex flex-col items-start gap-3 md:flex-row md:items-center">
        <Button
          className="app-primary-button h-12 rounded-2xl px-6 text-base font-semibold"
          onClick={() => router.push(hasResume ? "/interview" : "/setup")}
        >
          {nextStepLabel}
        </Button>
        <Button
          variant="outline"
          className="app-secondary-button h-12 rounded-2xl px-6"
          onClick={() => router.push(hasResume ? "/screen" : "/setup")}
        >
          {hasResume ? "View screening" : "Open setup"}
        </Button>
      </section>
    </div>
  );
}
