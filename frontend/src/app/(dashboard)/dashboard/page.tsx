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
      <section className="app-panel rounded-[32px] p-8">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.04em] app-text-primary sm:text-5xl">
          Welcome{userName ? `, ${userName}` : ""}.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 app-text-muted">
          From here you can upload a resume, run the screener, and start an interview session.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: FileText,
            title: "Resume",
            value: hasResume ? "Uploaded" : "Not uploaded",
            detail: hasResume ? "Resume data is ready to use." : "Upload a PDF to continue.",
          },
          {
            icon: language === "asl" ? Video : Mic,
            title: "Language mode",
            value: languageLabel[language] ?? language,
            detail: "This setting is used in the interview flow.",
          },
          {
            icon: ScanSearch,
            title: "Screening",
            value: hasResume ? "Available" : "Waiting for resume",
            detail: "Run resume analysis after uploading a file.",
          },
          {
            icon: Upload,
            title: "Setup",
            value: "Resume and language",
            detail: "Update your uploaded file and preferences.",
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
              <div>
                <CardTitle className="text-lg app-text-primary">{item.title}</CardTitle>
                <p className="mt-2 text-base font-medium app-text-secondary">{item.value}</p>
              </div>
              <CardDescription className="leading-7 app-text-muted">
                {item.detail}
              </CardDescription>
            </CardHeader>
          </AnimatedCard>
        ))}
      </section>

      <div className="flex flex-col gap-3 md:flex-row">
        <Button
          className="app-primary-button h-12 rounded-2xl px-6 text-base font-semibold"
          onClick={() => router.push(hasResume ? "/interview" : "/setup")}
        >
          {hasResume ? "Start Interview" : "Upload Resume"}
        </Button>
        <Button
          variant="outline"
          className="app-secondary-button h-12 rounded-2xl px-6"
          onClick={() => router.push("/screen")}
          disabled={!hasResume}
        >
          Screen Resume
        </Button>
        <Button
          variant="outline"
          className="app-secondary-button h-12 rounded-2xl px-6"
          onClick={() => router.push("/setup")}
        >
          Open Setup
        </Button>
      </div>
    </div>
  );
}
