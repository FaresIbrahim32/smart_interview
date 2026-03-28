"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { generateUserFolderName, uploadResume } from "@/lib/supabase/storage";
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
      // Call API to parse resume and detect field first to get user info
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

      const { fields, chunks } = await response.json();

      // Generate user-specific folder name
      const folderName = generateUserFolderName(
        fields.name,
        fields.email,
        userId
      );

      // Upload resume to Supabase Storage with user-specific folder structure
      const { fileName, error: uploadError } = await uploadResume(file, folderName);

      if (uploadError) throw uploadError;

      // Detect field from parsed data (you can enhance this logic)
      const detectedFieldValue = fields.summary ?
        (fields.summary.toLowerCase().includes('software') || fields.summary.toLowerCase().includes('developer') ? 'Software Engineering' : 'General')
        : 'General';

      setDetectedField(detectedFieldValue);

      // Save to database
      const { error: dbError } = await supabase.from("resumes").insert({
        user_id: userId,
        file_path: fileName,
        parsed_data: { fields, chunks },
        detected_field: detectedFieldValue,
      });

      if (dbError) throw dbError;

      // Update profile with language preference and field
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          language_preference: language,
          field: detectedFieldValue,
        })
        .eq("user_id", userId);

      if (profileError) throw profileError;

      // Redirect to dashboard
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to upload resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
      <Card className="w-full max-w-2xl border-border/50 shadow-2xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Set Up Your Profile
          </CardTitle>
          <CardDescription className="text-muted-foreground">
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
              <div className="p-4 rounded-lg bg-primary/20 border border-primary/30 backdrop-blur-sm">
                <p className="text-sm font-medium text-foreground">
                  Based on your resume, you fall under: <span className="text-primary font-bold">{detectedField}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  We'll prep you for interviews in this field
                </p>
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary via-purple-600 to-cyan-600 hover:from-primary/90 hover:via-purple-600/90 hover:to-cyan-600/90 shadow-xl font-medium"
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
