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
<<<<<<< HEAD
    <div className="space-y-6">
      <section className="panel-surface rounded-[32px] p-8">
        <div className="section-label">Resume screener</div>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
          Analyze your resume before you interview.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
          This pass predicts resume category, recommends a role fit, and extracts key
          details so you can calibrate the mock session that follows.
        </p>
      </section>

      {loading && (
        <Card className="panel-surface rounded-[32px]">
          <CardContent className="space-y-5 py-16 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/35 border-t-primary" />
            <div>
              <p className="text-lg font-medium text-foreground">Running resume analysis</p>
              <p className="mt-2 text-sm text-muted-foreground">
                We&apos;re screening the uploaded resume and generating a recommendation.
=======
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
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && error && (
        <Card className="rounded-[32px] border-red-400/20 bg-red-400/10">
          <CardContent className="space-y-4 py-12 text-center">
            <p className="text-lg font-medium text-red-100">{error}</p>
<<<<<<< HEAD
            <Button
              className="h-12 rounded-2xl bg-primary px-6 text-base font-semibold text-primary-foreground hover:bg-primary/90"
              onClick={() => router.push("/setup")}
            >
              Upload Resume
            </Button>
=======
            <div className="flex justify-center">
              <Button
                className="app-primary-button h-12 rounded-2xl px-6 text-base font-semibold"
                onClick={() => router.push("/setup")}
              >
                Upload resume
              </Button>
            </div>
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
          </CardContent>
        </Card>
      )}

      {!loading && result && (
        <div className="space-y-8">
          <section className="grid gap-5 md:grid-cols-2">
<<<<<<< HEAD
            <Card className="panel-surface rounded-[28px]">
              <CardHeader className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-foreground">Resume category</CardTitle>
                  <p className="mt-2 text-3xl font-semibold text-foreground">{result.category}</p>
                </div>
                <CardDescription className="leading-7 text-muted-foreground">
                  Predicted by the screening model from the contents of your uploaded resume.
=======
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
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
                </CardDescription>
              </CardHeader>
            </Card>

<<<<<<< HEAD
            <Card className="panel-surface rounded-[28px]">
              <CardHeader className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-foreground">Recommended role</CardTitle>
                  <p className="mt-2 text-3xl font-semibold text-foreground">{result.recommended_job}</p>
                </div>
                <CardDescription className="leading-7 text-muted-foreground">
                  Best-fit role surfaced by the recommendation pass.
=======
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
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
                </CardDescription>
              </CardHeader>
            </Card>
          </section>

<<<<<<< HEAD
          <Card className="panel-surface rounded-[32px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="h-5 w-5 text-primary" />
                Extracted contact info
=======
          <Card className="app-panel rounded-[32px]">
            <CardHeader className="space-y-3">
              <CardTitle className="flex items-center gap-2 app-text-primary">
                <User className="h-5 w-5" />
                Contact details
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
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
<<<<<<< HEAD
                <div
                  key={item.label}
                  className="rounded-[24px] border border-border/60 bg-background/55 p-4"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-base font-medium text-foreground">{item.value}</p>
=======
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
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
                </div>
              ))}
            </CardContent>
          </Card>

          {result.skills.length > 0 && (
<<<<<<< HEAD
            <Card className="panel-surface rounded-[32px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Tag className="h-5 w-5 text-primary" />
                  Skills detected
                </CardTitle>
                <CardDescription className="leading-7 text-muted-foreground">
                  {result.skills.length} matched skills found in your resume.
=======
            <Card className="app-panel rounded-[32px]">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-2 app-text-primary">
                  <Tag className="h-5 w-5" />
                  Skills
                </CardTitle>
                <CardDescription className="app-text-muted">
                  Skills found in your resume.
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {result.skills.map((skill) => (
<<<<<<< HEAD
                  <span
                    key={skill}
                    className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                  >
=======
                  <span key={skill} className="app-chip rounded-full px-3 py-1.5 text-sm font-medium">
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
                    {skill}
                  </span>
                ))}
              </CardContent>
            </Card>
          )}

          {result.education.length > 0 && (
<<<<<<< HEAD
            <Card className="panel-surface rounded-[32px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Education fields detected
=======
            <Card className="app-panel rounded-[32px]">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-2 app-text-primary">
                  <GraduationCap className="h-5 w-5" />
                  Education
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
                </CardTitle>
                <CardDescription className="app-text-muted">
                  Education fields detected from your resume.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {result.education.map((item) => (
                  <span
                    key={item}
<<<<<<< HEAD
                    className="rounded-full border border-border/70 bg-secondary px-3 py-1.5 text-sm font-medium text-foreground"
=======
                    className="app-panel-soft rounded-full px-3 py-1.5 text-sm font-medium app-text-secondary"
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
                  >
                    {item}
                  </span>
                ))}
              </CardContent>
            </Card>
          )}

          <section className="flex flex-col items-start gap-3 md:flex-row md:items-center">
            <Button
<<<<<<< HEAD
              className="h-12 rounded-2xl bg-primary px-6 text-base font-semibold text-primary-foreground hover:bg-primary/90"
=======
              className="app-primary-button h-12 rounded-2xl px-6 text-base font-semibold"
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
              onClick={() => router.push("/interview")}
            >
              Start interview
            </Button>
            <Button
              variant="outline"
<<<<<<< HEAD
              className="h-12 rounded-2xl border-border/70 bg-transparent px-6 text-foreground hover:bg-accent"
              onClick={() => router.push("/setup")}
            >
              Re-upload Resume
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-2xl border-border/70 bg-transparent px-6 text-foreground hover:bg-accent"
=======
              className="app-secondary-button h-12 rounded-2xl px-6"
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
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
