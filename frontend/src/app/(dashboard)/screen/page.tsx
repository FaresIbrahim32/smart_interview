"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  ScanSearch,
  Tag,
  User,
} from "lucide-react";
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
        setError(err.error || "Screening failed. Is the backend running?");
        setLoading(false);
        return;
      }

      setResult(await res.json());
      setLoading(false);
    };

    run();
  }, [router]);

  return (
    <div className="space-y-6">
      <section className="app-panel rounded-[32px] p-8">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] app-text-primary sm:text-5xl">
          Analyze your resume before you interview.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 app-text-muted">
          This pass predicts resume category, recommends a role fit, and extracts key
          details so you can calibrate the mock session that follows.
        </p>
      </section>

      {loading && (
        <Card className="app-panel rounded-[32px]">
          <CardContent className="space-y-5 py-16 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[color:var(--button-bg)] border-t-transparent" />
            <div>
              <p className="text-lg font-medium app-text-primary">Running resume analysis</p>
              <p className="mt-2 text-sm app-text-muted">
                We&apos;re screening the uploaded resume and generating a recommendation.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && error && (
        <Card className="rounded-[32px] border-red-400/20 bg-red-400/10">
          <CardContent className="space-y-4 py-12 text-center">
            <p className="text-lg font-medium text-red-100">{error}</p>
            <Button
              className="app-primary-button h-12 rounded-2xl px-6 text-base font-semibold"
              onClick={() => router.push("/setup")}
            >
              Upload Resume
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && result && (
        <div className="space-y-6">
          <section className="grid gap-5 md:grid-cols-2">
            <Card className="app-panel rounded-[28px]">
              <CardHeader className="space-y-4">
                <div className="app-panel-soft flex h-11 w-11 items-center justify-center rounded-2xl">
                  <Tag className="h-5 w-5 app-text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg app-text-primary">Resume category</CardTitle>
                  <p className="mt-2 text-3xl font-semibold app-text-primary">{result.category}</p>
                </div>
                <CardDescription className="leading-7 app-text-muted">
                  Predicted by the screening model from the contents of your uploaded resume.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="app-panel rounded-[28px]">
              <CardHeader className="space-y-4">
                <div className="app-panel-soft flex h-11 w-11 items-center justify-center rounded-2xl">
                  <Briefcase className="h-5 w-5 app-text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg app-text-primary">Recommended role</CardTitle>
                  <p className="mt-2 text-3xl font-semibold app-text-primary">{result.recommended_job}</p>
                </div>
                <CardDescription className="leading-7 app-text-muted">
                  Best-fit role surfaced by the recommendation pass.
                </CardDescription>
              </CardHeader>
            </Card>
          </section>

          <Card className="app-panel rounded-[32px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 app-text-primary">
                <User className="h-5 w-5" />
                Extracted contact info
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {[
                { icon: User, label: "Name", value: result.name || "Not found" },
                { icon: Mail, label: "Email", value: result.email || "Not found" },
                { icon: Phone, label: "Phone", value: result.phone || "Not found" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="app-panel-soft rounded-[24px] p-4"
                >
                  <div className="app-panel flex mb-3 h-10 w-10 items-center justify-center rounded-2xl">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.18em] app-text-muted">
                    {item.label}
                  </p>
                  <p className="mt-2 text-base font-medium app-text-primary">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {result.skills.length > 0 && (
            <Card className="app-panel rounded-[32px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 app-text-primary">
                  <Tag className="h-5 w-5" />
                  Skills detected
                </CardTitle>
                <CardDescription className="leading-7 app-text-muted">
                  {result.skills.length} matched skills found in your resume.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {result.skills.map((skill) => (
                  <span
                    key={skill}
                    className="app-chip rounded-full px-3 py-1.5 text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </CardContent>
            </Card>
          )}

          {result.education.length > 0 && (
            <Card className="app-panel rounded-[32px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 app-text-primary">
                  <GraduationCap className="h-5 w-5" />
                  Education fields detected
                </CardTitle>
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

          <div className="flex flex-col gap-3 md:flex-row">
            <Button
              className="app-primary-button h-12 rounded-2xl px-6 text-base font-semibold"
              onClick={() => router.push("/interview")}
            >
              Start Interview
            </Button>
            <Button
              variant="outline"
              className="app-secondary-button h-12 rounded-2xl px-6"
              onClick={() => router.push("/setup")}
            >
              Re-upload Resume
            </Button>
            <Button
              variant="outline"
              className="app-secondary-button h-12 rounded-2xl px-6"
              onClick={() => router.push("/dashboard")}
            >
              <ScanSearch className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
