"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AnimatedCard } from "@/components/ui/animated-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ParticleField from "@/components/3d/ParticleField";
import { Mic, Video, FileText, Settings, LogOut, Sparkles } from "lucide-react";

interface Profile {
  full_name: string | null;
  field: string | null;
  language_preference: "english" | "spanish" | "asl";
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!profileData || !profileData.field) {
        router.push("/setup");
        return;
      }

      setProfile(profileData);
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleStartInterview = () => {
    router.push("/interview");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const languageIcons = {
    english: <Mic className="h-6 w-6" />,
    spanish: <Mic className="h-6 w-6" />,
    asl: <Video className="h-6 w-6" />,
  };

  const languageLabels = {
    english: "English (Voice)",
    spanish: "Spanish (Voice)",
    asl: "American Sign Language (Camera)",
  };

  return (
    <div className="relative min-h-screen p-8">
      <ParticleField />
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}!
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Ready to practice your interview skills?
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </motion.div>

        {/* Profile Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatedCard delay={0.1}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Your Field
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-primary">
                {profile?.field || "Not set"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Questions tailored for this field
              </p>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {profile?.language_preference && languageIcons[profile.language_preference]}
                Interview Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-primary">
                {profile?.language_preference && languageLabels[profile.language_preference]}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Can be changed in settings
              </p>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Start Interview Card */}
        <AnimatedCard delay={0.3} className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
          <CardHeader>
            <CardTitle>Start Your Practice Interview</CardTitle>
            <CardDescription>
              Get personalized technical and behavioral questions based on your resume.
              {profile?.language_preference === "asl" && " Camera access will be requested."}
              {profile?.language_preference !== "asl" && " Microphone access will be requested."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">What to expect:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>8 personalized technical questions from your resume</li>
                <li>Behavioral questions covering common interview scenarios</li>
                <li>Follow-up questions based on your answers</li>
                <li>Real-time feedback and tips</li>
              </ul>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                onClick={handleStartInterview}
              >
              {profile?.language_preference === "asl" ? (
                <>
                  <Video className="mr-2 h-5 w-5" />
                  Start Interview (ASL Mode)
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  Start Interview
                </>
              )}
              </Button>
            </motion.div>
          </CardContent>
        </AnimatedCard>

        {/* Settings Link */}
        <div className="text-center">
          <Button variant="ghost" onClick={() => router.push("/setup")}>
            <Settings className="mr-2 h-4 w-4" />
            Update Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
