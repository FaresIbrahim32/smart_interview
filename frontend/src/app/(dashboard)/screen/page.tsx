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
      <section className="rounded-[32px] border border-white/10 bg-[#0d141b] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
        <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-cyan-100">
          Resume screener
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
          Analyze your resume before you interview.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-400">
          This pass predicts resume category, recommends a role fit, and extracts key
          details so you can calibrate the mock session that follows.
        </p>
      </section>

      {loading && (
        <Card className="rounded-[32px] border-white/10 bg-[#0d141b]">
          <CardContent className="space-y-5 py-16 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-300 border-t-transparent" />
            <div>
              <p className="text-lg font-medium text-white">Running resume analysis</p>
              <p className="mt-2 text-sm text-slate-400">
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
              className="h-12 rounded-2xl bg-emerald-400 px-6 text-base font-semibold text-[#092014] hover:bg-emerald-300"
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
            <Card className="rounded-[28px] border-white/10 bg-[#0d141b]">
              <CardHeader className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-200">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white">Resume category</CardTitle>
                  <p className="mt-2 text-3xl font-semibold text-white">{result.category}</p>
                </div>
                <CardDescription className="leading-7 text-slate-400">
                  Predicted by the screening model from the contents of your uploaded resume.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-[28px] border-white/10 bg-[#0d141b]">
              <CardHeader className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-300/12 text-emerald-200">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white">Recommended role</CardTitle>
                  <p className="mt-2 text-3xl font-semibold text-white">{result.recommended_job}</p>
                </div>
                <CardDescription className="leading-7 text-slate-400">
                  Best-fit role surfaced by the recommendation pass.
                </CardDescription>
              </CardHeader>
            </Card>
          </section>

          <Card className="rounded-[32px] border-white/10 bg-[#0d141b]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-5 w-5 text-emerald-300" />
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
                  className="rounded-[24px] border border-white/8 bg-[#0b1117] p-4"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] text-slate-300">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-base font-medium text-white">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {result.skills.length > 0 && (
            <Card className="rounded-[32px] border-white/10 bg-[#0d141b]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Tag className="h-5 w-5 text-cyan-200" />
                  Skills detected
                </CardTitle>
                <CardDescription className="leading-7 text-slate-400">
                  {result.skills.length} matched skills found in your resume.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {result.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-sm font-medium text-emerald-100"
                  >
                    {skill}
                  </span>
                ))}
              </CardContent>
            </Card>
          )}

          {result.education.length > 0 && (
            <Card className="rounded-[32px] border-white/10 bg-[#0d141b]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <GraduationCap className="h-5 w-5 text-amber-200" />
                  Education fields detected
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {result.education.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-sm font-medium text-amber-100"
                  >
                    {item}
                  </span>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-3 md:flex-row">
            <Button
              className="h-12 rounded-2xl bg-emerald-400 px-6 text-base font-semibold text-[#092014] hover:bg-emerald-300"
              onClick={() => router.push("/interview")}
            >
              Start Interview
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-2xl border-white/10 bg-transparent px-6 text-slate-100 hover:bg-white/5"
              onClick={() => router.push("/setup")}
            >
              Re-upload Resume
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-2xl border-white/10 bg-transparent px-6 text-slate-100 hover:bg-white/5"
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
