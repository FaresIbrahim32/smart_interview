"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    <Card className="app-panel rounded-[32px]">
      <CardHeader className="space-y-4">
        <CardTitle className="text-3xl app-text-primary">Setup</CardTitle>
        <CardDescription className="max-w-2xl text-base leading-7 app-text-muted">
          Upload a resume PDF and choose the interview language used by the session flow.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="resume" className="app-text-secondary">
              Resume PDF
            </Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="app-input h-12 cursor-pointer rounded-2xl"
            />
            {file && <p className="text-sm app-text-muted">{file.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="app-text-secondary">
              Interview language
            </Label>
            <Select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as "english" | "spanish" | "asl")}
              className="app-input h-12 rounded-2xl"
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
              className="app-primary-button h-12 rounded-2xl px-6 text-base font-semibold"
              disabled={!file || loading}
            >
              {loading ? "Parsing resume..." : "Save and Continue"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="app-secondary-button h-12 rounded-2xl px-6"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
