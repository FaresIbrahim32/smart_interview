"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mic, Video, MicOff, VideoOff, ArrowLeft } from "lucide-react";

type LanguagePreference = "english" | "spanish" | "asl";

export default function InterviewPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<LanguagePreference>("english");
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("language_preference")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setLanguage(profileData.language_preference);
      }
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const requestPermissions = async () => {
    try {
      const constraints = language === "asl"
        ? { video: true, audio: false }
        : { video: false, audio: true };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setPermissionGranted(true);
      setPermissionDenied(false);

      if (language === "asl" && videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Permission denied:", error);
      setPermissionDenied(true);
      setPermissionGranted(false);
    }
  };

  const stopMediaStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setPermissionGranted(false);
  };

  const handleGoBack = () => {
    stopMediaStream();
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Interview Session</h1>
            <p className="text-muted-foreground">
              {language === "asl" ? "ASL Mode (Camera)" : `${language === "spanish" ? "Spanish" : "English"} Mode (Voice)`}
            </p>
          </div>
        </div>

        {/* Permission Request */}
        {!permissionGranted && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {language === "asl" ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
                {language === "asl" ? "Camera" : "Microphone"} Access Required
              </CardTitle>
              <CardDescription>
                We need access to your {language === "asl" ? "camera to detect sign language" : "microphone to record your responses"}.
                Your privacy is important - recordings are not saved without your permission.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {permissionDenied && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">
                    Permission denied. Please enable {language === "asl" ? "camera" : "microphone"} access in your browser settings and try again.
                  </p>
                </div>
              )}
              <Button onClick={requestPermissions} className="w-full">
                {language === "asl" ? (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Grant Camera Access
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Grant Microphone Access
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Interview Interface */}
        {permissionGranted && (
          <div className="space-y-6">
            {/* Video/Audio Display */}
            {language === "asl" && (
              <Card>
                <CardContent className="p-6">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <div className="px-3 py-1 rounded-full bg-green-500/90 text-white text-sm font-medium flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        Camera Active
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {language !== "asl" && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                        <Mic className="h-10 w-10 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium">Microphone Active</p>
                        <p className="text-sm text-muted-foreground">
                          Ready to record your responses
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interview Content Area */}
            <Card>
              <CardHeader>
                <CardTitle>Interview Ready</CardTitle>
                <CardDescription>
                  Your teammates are still working on integrating the question generation and TTS APIs.
                  This interface is ready to display questions and capture responses.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">
                      <strong>Next steps for your team:</strong>
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                      <li>Connect to RAG API for technical question generation</li>
                      <li>Integrate ElevenLabs TTS for audio playback</li>
                      <li>Connect to behavioral questions database</li>
                      <li>Add speech-to-text for response capture</li>
                      <li>Implement ASL sign recognition display</li>
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={stopMediaStream}>
                      {language === "asl" ? (
                        <>
                          <VideoOff className="mr-2 h-4 w-4" />
                          Stop Camera
                        </>
                      ) : (
                        <>
                          <MicOff className="mr-2 h-4 w-4" />
                          Stop Microphone
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
