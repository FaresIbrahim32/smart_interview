"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mic, MicOff, Send, Video, Volume2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Language = "english" | "spanish" | "asl";
type Phase = "loading" | "generating" | "interviewing";
type Mode = "technical" | "behavioral";

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export default function InterviewPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const sessionId = useRef(`session_${Date.now()}`);

  const [language, setLanguage] = useState<Language>("english");
  const languageRef = useRef<Language>("english");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [camGranted, setCamGranted] = useState(false);

  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);

  const [technicalQs, setTechnicalQs] = useState<string[]>([]);
  const [behavioralQs, setBehavioralQs] = useState<string[]>([]);
  const [mode, setMode] = useState<Mode>("technical");
  const [techIndex, setTechIndex] = useState(0);
  const [behavIndex, setBehavIndex] = useState(0);
  const [followup, setFollowup] = useState<string | null>(null);
  const [inFollowup, setInFollowup] = useState(false);

  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const playAudio = useCallback((b64: string) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = url;
    audioRef.current.onended = () => setIsSpeaking(false);
    audioRef.current.play().catch(() => setIsSpeaking(false));
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (languageRef.current === "asl" || !text) return;
      setIsSpeaking(true);

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language: languageRef.current }),
        });

        if (res.ok) {
          const { audio_base64 } = await res.json();
          if (audio_base64) {
            playAudio(audio_base64);
            return;
          }
        }
      } catch {
        // Non-blocking.
      }

      setIsSpeaking(false);
    },
    [playAudio]
  );

  const startRecording = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = languageRef.current === "spanish" ? "es-ES" : "en-US";

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map((r: SpeechRecognitionResult) => r[0].transcript)
        .join("");
      setAnswer(transcript);
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);

    rec.start();
    recognitionRef.current = rec;
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const rawChunks = localStorage.getItem("interview_chunks");
      const lang = (localStorage.getItem("interview_language") as Language) || "english";
      languageRef.current = lang;
      setLanguage(lang);

      if (!rawChunks) {
        setError("No resume found. Please upload your resume first.");
        return;
      }

      const chunks = JSON.parse(rawChunks);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      fetch(`${apiUrl}/interview/init-session?session_id=${sessionId.current}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chunks),
      }).catch(() => null);

      setPhase("generating");

      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chunks, language: lang }),
      });

      if (!res.ok) {
        setError("Failed to generate questions. Is the backend running?");
        setPhase("loading");
        return;
      }

      const { technical_questions, behavioral_questions } = await res.json();
      const nextBehavioralQuestions: string[] = behavioral_questions.map(
        (q: { question: string }) => q.question
      );

      setTechnicalQs(technical_questions);
      setBehavioralQs(nextBehavioralQuestions);
      setPhase("interviewing");

      if (technical_questions[0]) {
        setTimeout(() => speak(technical_questions[0]), 500);
      }
    };

    init();
  }, [router, speak]);

  const questions = mode === "technical" ? technicalQs : behavioralQs;
  const index = mode === "technical" ? techIndex : behavIndex;
  const currentQuestion = questions[index] ?? null;
  const isDone = phase === "interviewing" && index >= questions.length && !inFollowup;

  useEffect(() => {
    if (phase !== "interviewing") return;
    const question = inFollowup ? followup : currentQuestion;
    if (question) speak(question);
  }, [phase, followup, inFollowup, currentQuestion, speak]);

  const startCamera = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(media);
      setCamGranted(true);
      if (videoRef.current) videoRef.current.srcObject = media;
    } catch {
      // Permission denied.
    }
  };

  const stopMedia = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setCamGranted(false);
  }, [stream]);

  useEffect(() => stopMedia, [stopMedia]);

  const advance = useCallback(() => {
    setFollowup(null);
    setInFollowup(false);
    setAnswer("");
    if (mode === "technical") {
      setTechIndex((current) => current + 1);
      return;
    }
    setBehavIndex((current) => current + 1);
  }, [mode]);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setFollowup(null);
    setInFollowup(false);
    setAnswer("");
    const nextQuestions = nextMode === "technical" ? technicalQs : behavioralQs;
    const nextIndex = nextMode === "technical" ? techIndex : behavIndex;
    if (nextQuestions[nextIndex]) {
      setTimeout(() => speak(nextQuestions[nextIndex]), 300);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim() || isSubmitting || !currentQuestion) return;
    setIsSubmitting(true);

    const question = inFollowup && followup ? followup : currentQuestion;

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId.current,
          question,
          answer,
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (inFollowup) {
          advance();
        } else {
          setFollowup(data.followup_question);
          setInFollowup(true);
          if (data.audio_base64) playAudio(data.audio_base64);
        }
      } else {
        advance();
      }
    } catch {
      advance();
    } finally {
      setAnswer("");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="app-panel rounded-[32px] p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] app-text-primary sm:text-5xl">
              Interview session
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 app-text-muted">
              Answer technical and behavioral questions using text, voice, or ASL mode.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              stopMedia();
              router.push("/dashboard");
            }}
            className="app-secondary-button h-12 rounded-2xl px-5"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </section>

      {(phase === "loading" || phase === "generating") && (
        <Card className="app-panel rounded-[32px]">
          <CardContent className="space-y-5 py-16 text-center">
            {error ? (
              <>
                <p className="text-lg font-medium text-red-200">{error}</p>
                <Button
                  className="app-primary-button h-12 rounded-2xl px-6 text-base font-semibold"
                  onClick={() => router.push("/setup")}
                >
                  Upload Resume
                </Button>
              </>
            ) : (
              <>
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[color:var(--button-bg)] border-t-transparent" />
                <div>
                  <p className="text-lg font-medium app-text-primary">
                    {phase === "generating" ? "Generating questions" : "Loading session"}
                  </p>
                  <p className="mt-2 text-sm app-text-muted">
                    {phase === "generating"
                      ? "Analyzing your resume content to create technical and behavioral prompts."
                      : "Preparing the interview environment."}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {phase === "interviewing" && (
        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { key: "technical", label: "Technical", count: `${techIndex}/${technicalQs.length}` },
              { key: "behavioral", label: "Behavioral", count: `${behavIndex}/${behavioralQs.length}` },
            ].map((item) => {
              const active = mode === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => !active && switchMode(item.key as Mode)}
                  className={`rounded-[28px] border p-5 text-left transition ${
                    active ? "app-chip" : "app-panel"
                  }`}
                >
                  <p className="text-sm uppercase tracking-[0.18em] app-text-muted">Mode</p>
                  <p className="mt-2 text-xl font-semibold app-text-primary">{item.label}</p>
                  <p className="mt-2 text-sm app-text-muted">{item.count} completed</p>
                </button>
              );
            })}
          </div>

          {isDone ? (
            <Card className="app-panel rounded-[32px]">
              <CardContent className="space-y-4 py-12 text-center">
                <p className="text-2xl font-semibold app-text-primary">
                  {mode === "technical" ? "Technical" : "Behavioral"} questions complete
                </p>
                <div className="flex flex-col justify-center gap-3 md:flex-row">
                  <Button
                    className="app-primary-button h-12 rounded-2xl px-6 text-base font-semibold"
                    onClick={() =>
                      switchMode(mode === "technical" ? "behavioral" : "technical")
                    }
                  >
                    Switch Mode
                  </Button>
                  <Button
                    variant="outline"
                    className="app-secondary-button h-12 rounded-2xl px-6"
                    onClick={() => router.push("/dashboard")}
                  >
                    Return to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <Card className="app-panel rounded-[32px]">
                  <CardHeader className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] app-text-muted">
                          Progress
                        </p>
                        <p className="mt-2 text-sm app-text-secondary">
                          Question {index + 1} of {questions.length}
                          {inFollowup ? " - Follow-up" : ""}
                        </p>
                      </div>
                      <span className="app-chip rounded-full px-3 py-1 text-xs font-medium">
                        {mode === "technical" ? "Technical" : "Behavioral"}
                      </span>
                    </div>
                    <div className="app-panel-soft h-2 rounded-full">
                      <div
                        className="h-2 rounded-full bg-[color:var(--button-bg)] transition-all"
                        style={{ width: `${((index + 1) / Math.max(questions.length, 1)) * 100}%` }}
                      />
                    </div>
                  </CardHeader>
                </Card>

                <Card className="app-panel rounded-[32px]">
                  <CardHeader className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CardTitle className="flex-1 text-2xl leading-tight app-text-primary">
                        {inFollowup ? followup : currentQuestion}
                      </CardTitle>
                      {language !== "asl" && currentQuestion && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-11 w-11 rounded-2xl app-text-secondary hover:opacity-80"
                          disabled={isSpeaking}
                          onClick={() => speak(inFollowup && followup ? followup : currentQuestion)}
                          title="Replay question"
                        >
                          <Volume2 className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                    {inFollowup && (
                      <CardDescription className="text-base app-text-muted">
                        Follow-up based on your previous answer.
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <textarea
                      className="app-input min-h-[180px] w-full resize-none rounded-[24px] px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder={isRecording ? "Listening..." : "Type or record your answer..."}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
                      }}
                    />

                    <div className="flex flex-wrap items-center gap-3">
                      {language !== "asl" && (
                        <Button
                          variant={isRecording ? "destructive" : "outline"}
                          onClick={isRecording ? stopRecording : startRecording}
                          className="app-secondary-button h-11 rounded-2xl px-4"
                        >
                          {isRecording ? (
                            <>
                              <MicOff className="mr-2 h-4 w-4" />
                              Stop Recording
                            </>
                          ) : (
                            <>
                              <Mic className="mr-2 h-4 w-4" />
                              Record Answer
                            </>
                          )}
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        onClick={advance}
                        className="h-11 rounded-2xl px-4 app-text-muted hover:opacity-80"
                      >
                        Skip
                      </Button>

                      <Button
                        onClick={handleSubmit}
                        disabled={!answer.trim() || isSubmitting}
                        className="app-primary-button ml-auto h-11 rounded-2xl px-5 font-semibold"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {isSubmitting ? "Processing..." : inFollowup ? "Next Question" : "Submit"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {language === "asl" && (
                  <Card className="app-panel rounded-[32px]">
                    <CardHeader>
                      <CardTitle className="app-text-primary">ASL camera panel</CardTitle>
                      <CardDescription className="leading-7 app-text-muted">
                        Enable camera access to practice in ASL mode.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!camGranted ? (
                        <Button
                          className="app-primary-button h-12 w-full rounded-2xl text-base font-semibold"
                          onClick={startCamera}
                        >
                          <Video className="mr-2 h-5 w-5" />
                          Grant Camera Access
                        </Button>
                      ) : (
                        <div className="relative overflow-hidden rounded-[24px] border border-[color:var(--panel-border)] bg-black">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="aspect-video w-full object-cover"
                          />
                          <span className="app-chip absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                            Live camera
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card className="app-panel rounded-[32px]">
                  <CardHeader>
                    <CardTitle className="app-text-primary">Session guide</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm leading-7 app-text-muted">
                    <p>Technical questions are grounded in your uploaded resume content.</p>
                    <p>Behavioral questions focus on communication and decision-making.</p>
                    <p>Use Ctrl+Enter or Cmd+Enter to submit from the answer box.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
