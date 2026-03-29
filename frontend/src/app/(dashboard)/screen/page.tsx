"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, GraduationCap, Mail, Phone, Tag, User } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ScreenResult {
  category: string;
  recommended_job: string;
  skills: string[];
  education: string[];
  name: string | null;
  email: string | null;
  phone: string | null;
}

export default function ScreenPage() {
  const router = useRouter();
  const [result, setResult] = useState<ScreenResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const raw = localStorage.getItem("interview_chunks");
      if (!raw) {
        setError("No resume found. Upload your resume first.");
        setLoading(false);
        return;
      }

      const chunks = JSON.parse(raw);
      const res = await fetch("/api/screen-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chunks }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Screening failed.");
        setLoading(false);
        return;
      }

      setResult(await res.json());
      setLoading(false);
    };

    run();
  }, [router]);

  return (
    <div className="space-y-8">
      <section className="app-panel rounded-[32px] p-8 lg:p-10">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] app-text-primary sm:text-5xl">
            Resume screening
          </h1>
          <p className="text-lg leading-8 app-text-muted">
            Review how the app categorizes your resume before you begin practicing.
          </p>
        </div>
      </section>

      {loading && (
        <Card className="app-panel rounded-[32px]">
          <CardContent className="space-y-5 py-16 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[color:var(--button-bg)] border-t-transparent" />
            <div className="space-y-2">
              <p className="text-lg font-medium app-text-primary">Running resume analysis</p>
              <p className="text-sm app-text-muted">
                We are preparing your screening results now.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && error && (
        <Card className="rounded-[32px] border-red-400/20 bg-red-400/10">
          <CardContent className="space-y-4 py-12 text-center">
            <p className="text-lg font-medium text-red-100">{error}</p>
            <div className="flex justify-center">
              <Button
                className="app-primary-button h-12 rounded-2xl px-6 text-base font-semibold"
                onClick={() => router.push("/setup")}
              >
                Upload resume
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && result && (
        <div className="space-y-8">
          <section className="grid gap-5 md:grid-cols-2">
            <Card className="app-panel rounded-[28px]">
              <CardHeader className="space-y-4">
                <div className="app-panel-soft flex h-11 w-11 items-center justify-center rounded-2xl">
                  <Tag className="h-5 w-5 app-text-primary" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg app-text-primary">Resume category</CardTitle>
                  <p className="text-3xl font-semibold app-text-primary">{result.category}</p>
                </div>
                <CardDescription className="leading-7 app-text-muted">
                  This is the main category detected from your uploaded resume.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="app-panel rounded-[28px]">
              <CardHeader className="space-y-4">
                <div className="app-panel-soft flex h-11 w-11 items-center justify-center rounded-2xl">
                  <Briefcase className="h-5 w-5 app-text-primary" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg app-text-primary">Recommended role</CardTitle>
                  <p className="text-3xl font-semibold app-text-primary">{result.recommended_job}</p>
                </div>
                <CardDescription className="leading-7 app-text-muted">
                  This role best matches the information found in your resume.
                </CardDescription>
              </CardHeader>
            </Card>
          </section>

          <Card className="app-panel rounded-[32px]">
            <CardHeader className="space-y-3">
              <CardTitle className="flex items-center gap-2 app-text-primary">
                <User className="h-5 w-5" />
                Contact details
              </CardTitle>
              <CardDescription className="app-text-muted">
                These details were pulled from the resume you uploaded.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {[
                { icon: User, label: "Name", value: result.name || "Not found" },
                { icon: Mail, label: "Email", value: result.email || "Not found" },
                { icon: Phone, label: "Phone", value: result.phone || "Not found" },
              ].map((item) => (
                <div key={item.label} className="app-panel-soft rounded-[24px] p-5">
                  <div className="app-panel mb-4 flex h-10 w-10 items-center justify-center rounded-2xl">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] app-text-muted">
                      {item.label}
                    </p>
                    <p className="text-base font-medium app-text-primary">{item.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {result.skills.length > 0 && (
            <Card className="app-panel rounded-[32px]">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-2 app-text-primary">
                  <Tag className="h-5 w-5" />
                  Skills
                </CardTitle>
                <CardDescription className="app-text-muted">
                  Skills found in your resume.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {result.skills.map((skill) => (
                  <span key={skill} className="app-chip rounded-full px-3 py-1.5 text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </CardContent>
            </Card>
          )}

          {result.education.length > 0 && (
            <Card className="app-panel rounded-[32px]">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-2 app-text-primary">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
                <CardDescription className="app-text-muted">
                  Education fields detected from your resume.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {result.education.map((item) => (
                  <span
                    key={item}
                    className="app-panel-soft rounded-full px-3 py-1.5 text-sm font-medium app-text-secondary"
                  >
                    {item}
                  </span>
                ))}
              </CardContent>
            </Card>
          )}

          <section className="flex flex-col items-start gap-3 md:flex-row md:items-center">
            <Button
              className="app-primary-button h-12 rounded-2xl px-6 text-base font-semibold"
              onClick={() => router.push("/interview")}
            >
              Start interview
            </Button>
            <Button
              variant="outline"
              className="app-secondary-button h-12 rounded-2xl px-6"
              onClick={() => router.push("/dashboard")}
            >
              Back to dashboard
            </Button>
          </section>
        </div>
      )}
    </div>
  );
}
