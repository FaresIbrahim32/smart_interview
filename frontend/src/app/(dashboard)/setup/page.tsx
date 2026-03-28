"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<"english" | "spanish" | "asl">("english");
  const [detectedField, setDetectedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUserId(user.id);
      }
    };
    getUser();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Please select a PDF file");
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !userId) return;

    setLoading(true);
    setError(null);

    try {
      // Upload resume to Supabase Storage
      const fileName = `${userId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Call API to parse resume and detect field
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", userId);

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to parse resume");
      }

      const { field, parsed_data } = await response.json();
      setDetectedField(field);

      // Save to database
      const { error: dbError } = await supabase.from("resumes").insert({
        user_id: userId,
        file_path: fileName,
        parsed_data,
        detected_field: field,
      });

      if (dbError) throw dbError;

      // Update profile with language preference and field
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          language_preference: language,
          field: field,
        })
        .eq("user_id", userId);

      if (profileError) throw profileError;

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to upload resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Set Up Your Profile</CardTitle>
          <CardDescription>
            Upload your resume and select your preferred interview language
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Resume Upload */}
            <div className="space-y-2">
              <Label htmlFor="resume">Resume (PDF)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {file && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Upload className="h-4 w-4" />
                    {file.name}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                We'll analyze your resume to generate personalized interview questions
              </p>
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <Label htmlFor="language">Interview Language</Label>
              <Select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as "english" | "spanish" | "asl")}
              >
                <option value="english">English (Voice & Text)</option>
                <option value="spanish">Spanish (Voice & Text)</option>
                <option value="asl">American Sign Language (Camera & Text)</option>
              </Select>
              <p className="text-xs text-muted-foreground">
                You can change this anytime from your settings
              </p>
            </div>

            {/* Detected Field Display */}
            {detectedField && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm font-medium">
                  Based on your resume, you fall under: <span className="text-primary">{detectedField}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  We'll prep you for interviews in this field
                </p>
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!file || loading}
            >
              {loading ? "Processing..." : "Continue to Dashboard"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
