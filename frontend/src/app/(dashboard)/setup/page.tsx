"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Languages, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SetupPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<"english" | "spanish" | "asl">("english");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
      else setUserId(user.id);
    });
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = e.target.files?.[0];
    if (!nextFile) return;

    if (nextFile.type !== "application/pdf") {
      setError("Please select a PDF file");
      return;
    }

    setFile(nextFile);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", userId);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Backend could not parse the resume. Is it running?");
      }

      const { chunks } = await res.json();

      if (!chunks || chunks.length === 0) {
        throw new Error("No content extracted from your resume. Try a different PDF.");
      }

      localStorage.setItem("interview_chunks", JSON.stringify(chunks));
      localStorage.setItem("interview_language", language);

      await supabase
        .from("profiles")
        .update({ language_preference: language })
        .eq("user_id", userId);

      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="rounded-[32px] border-white/10 bg-[#0d141b] shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
        <CardHeader className="space-y-4">
          <div className="inline-flex w-fit rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-emerald-100">
            Setup
          </div>
          <CardTitle className="text-3xl text-white">Upload the resume that will drive your session</CardTitle>
          <CardDescription className="max-w-2xl text-base leading-7 text-slate-400">
            We parse the PDF, save the chunks locally for your practice flow, and store
            your language preference so screening and interviews stay aligned.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="rounded-[28px] border border-white/8 bg-[#0b1117] p-5">
              <Label htmlFor="resume" className="text-slate-200">
                Resume PDF
              </Label>
              <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="h-12 cursor-pointer rounded-2xl border-white/10 bg-[#081017] text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-300/15 file:px-3 file:py-2 file:text-emerald-100 placeholder:text-slate-500 focus-visible:ring-emerald-300"
                />
                {file && (
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                    <Upload className="h-4 w-4 text-emerald-300" />
                    {file.name}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-[#0b1117] p-5">
              <Label htmlFor="language" className="text-slate-200">
                Interview language
              </Label>
              <Select
                id="language"
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value as "english" | "spanish" | "asl")
                }
                className="mt-3 h-12 rounded-2xl border-white/10 bg-[#081017] text-white focus-visible:ring-emerald-300"
              >
                <option value="english">English (Voice)</option>
                <option value="spanish">Spanish (Voice)</option>
                <option value="asl">American Sign Language (Camera)</option>
              </Select>
            </div>

            {error && (
              <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-3 md:flex-row">
              <Button
                type="submit"
                className="h-12 rounded-2xl bg-emerald-400 px-6 text-base font-semibold text-[#092014] hover:bg-emerald-300"
                disabled={!file || loading}
              >
                {loading ? "Parsing resume..." : "Continue to Dashboard"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-2xl border-white/10 bg-transparent px-6 text-slate-100 hover:bg-white/5"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
            </div>

            {loading && (
              <p className="text-sm text-slate-400">
                Sending your resume through the parsing pipeline. This usually takes a
                few seconds.
              </p>
            )}
          </CardContent>
        </form>
      </Card>

      <div className="space-y-4">
        {[
          {
            icon: FileText,
            title: "Resume parsing",
            copy: "We extract content from your PDF and save the resulting chunks for your practice session.",
          },
          {
            icon: Languages,
            title: "Language profile",
            copy: "The mode you choose here is reused by the interview flow and stored as your preference.",
          },
          {
            icon: Upload,
            title: "Re-upload anytime",
            copy: "You can replace the resume later if you tailor it for a different role.",
          },
        ].map((item) => (
          <Card
            key={item.title}
            className="rounded-[28px] border-white/10 bg-white/[0.03]"
          >
            <CardHeader className="space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-300/12 text-emerald-200">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                <CardDescription className="mt-2 leading-7 text-slate-400">
                  {item.copy}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
