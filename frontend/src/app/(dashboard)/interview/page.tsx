"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mic, MicOff, Send, Video, Volume2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Language = "english" | "spanish" | "asl";
type Phase = "loading" | "generating" | "interviewing" | "done";
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

  // ASL state
  const [aslText, setAslText] = useState("");
  const [aslConfidence, setAslConfidence] = useState(0);
  const [aslLastSign, setAslLastSign] = useState("");
  const [isAslProcessing, setIsAslProcessing] = useState(false);
  const aslSessionId = useRef(`asl_${Date.now()}`);
  const aslIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // ASL processing functions
  const startAslProcessing = useCallback(() => {
    if (!videoRef.current || !camGranted) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 320;
    canvas.height = 240;

    const processFrame = async () => {
      if (!videoRef.current || !ctx) return;

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const frameData = canvas.toDataURL('image/jpeg', 0.8);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/asl/process-frame`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: aslSessionId.current,
            frame: frameData,
            width: canvas.width,
            height: canvas.height
          })
        });

        if (res.ok) {
          const data = await res.json();
          setAslText(data.buffer || '');
          setAslConfidence(data.confidence || 0);
          setAslLastSign(data.last_sign || '');
        }
      } catch (error) {
        console.error('ASL processing error:', error);
      }
    };

    // Process frames at ~10 FPS
    aslIntervalRef.current = setInterval(processFrame, 100);
    setIsAslProcessing(true);
  }, [camGranted]);

  const stopAslProcessing = useCallback(() => {
    if (aslIntervalRef.current) {
      clearInterval(aslIntervalRef.current);
      aslIntervalRef.current = null;
    }
    setIsAslProcessing(false);
  }, []);

  const resetAslBuffer = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${apiUrl}/asl/reset?session_id=${aslSessionId.current}`, {
        method: 'POST'
      });
      setAslText('');
      setAslLastSign('');
      setAslConfidence(0);
    } catch (error) {
      console.error('ASL reset error:', error);
    }
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
      const behavioralStrings: string[] = behavioral_questions.map(
        (q: { question: string }) => q.question
      );

      setTechnicalQs(technical_questions);
      setBehavioralQs(behavioralStrings);
      setPhase("interviewing");
      setTimeout(() => speak(technical_questions[0]), 500);
    };

    init();
  }, [router, speak]);

  useEffect(() => {
    if (phase !== "interviewing") return;
    const question = inFollowup ? followup : currentQuestion;
    if (question) speak(question);
  }, [techIndex, behavIndex, mode, inFollowup, followup, phase, speak]);

  const startCamera = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(media);
      setCamGranted(true);
      if (videoRef.current) videoRef.current.srcObject = media;

      // Start ASL processing if in ASL mode
      if (language === 'asl') {
        setTimeout(startAslProcessing, 500); // Wait for video to load
      }
    } catch {
      // Permission denied.
    }
  };

  const stopMedia = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setCamGranted(false);
    stopAslProcessing();
  }, [stream, stopAslProcessing]);

  useEffect(() => stopMedia, [stopMedia]);

  // ASL processing effect
  useEffect(() => {
    if (language === 'asl' && camGranted && !isAslProcessing) {
      startAslProcessing();
    } else if (language !== 'asl' || !camGranted) {
      stopAslProcessing();
    }
  }, [language, camGranted, isAslProcessing, startAslProcessing, stopAslProcessing]);

  const questions = mode === "technical" ? technicalQs : behavioralQs;
  const index = mode === "technical" ? techIndex : behavIndex;
  const setIndex = mode === "technical" ? setTechIndex : setBehavIndex;
  const isDone = phase === "interviewing" && index >= questions.length && !inFollowup;
  const currentQuestion = questions[index] ?? null;

  const advance = useCallback(() => {
    setFollowup(null);
    setInFollowup(false);
    setAnswer("");
    setIndex((current) => current + 1);
  }, [setIndex]);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setFollowup(null);
    setInFollowup(false);
    setAnswer("");

    const nextQuestions = nextMode === "technical" ? technicalQs : behavioralQs;
    const nextIndex = nextMode === "technical" ? techIndex : behavIndex;
    setTimeout(() => {
      if (nextQuestions[nextIndex]) speak(nextQuestions[nextIndex]);
    }, 300);
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
      <section className="rounded-[32px] border border-white/10 bg-[#0d141b] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-emerald-100">
              Interview session
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Practice in a focused, live-session workspace.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-400">
              Move through technical and behavioral questions with voice playback,
              optional speech-to-text, and ASL camera support when needed.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              stopMedia();
              router.push("/dashboard");
            }}
            className="h-12 rounded-2xl border-white/10 bg-transparent px-5 text-slate-100 hover:bg-white/5"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </section>

      {(phase === "loading" || phase === "generating") && (
        <Card className="rounded-[32px] border-white/10 bg-[#0d141b]">
          <CardContent className="space-y-5 py-16 text-center">
            {error ? (
              <>
                <p className="text-lg font-medium text-red-200">{error}</p>
                <Button
                  className="h-12 rounded-2xl bg-emerald-400 px-6 text-base font-semibold text-[#092014] hover:bg-emerald-300"
                  onClick={() => router.push("/setup")}
                >
                  Upload Resume
                </Button>
              </>
            ) : (
              <>
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-300 border-t-transparent" />
                <div>
                  <p className="text-lg font-medium text-white">
                    {phase === "generating" ? "Generating your question set" : "Loading session"}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    {phase === "generating"
                      ? "Analyzing your resume content to create technical and behavioral prompts."
                      : "Preparing your interview environment."}
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
            <button
              type="button"
              onClick={() => mode !== "technical" && switchMode("technical")}
              className={`rounded-[28px] border p-5 text-left transition ${
                mode === "technical"
                  ? "border-emerald-300/30 bg-emerald-300/10"
                  : "border-white/10 bg-[#0d141b] hover:bg-white/[0.04]"
              }`}
            >
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Mode one</p>
              <p className="mt-2 text-xl font-semibold text-white">Technical</p>
              <p className="mt-2 text-sm text-slate-400">
                {techIndex}/{technicalQs.length} completed
              </p>
            </button>

            <button
              type="button"
              onClick={() => mode !== "behavioral" && switchMode("behavioral")}
              className={`rounded-[28px] border p-5 text-left transition ${
                mode === "behavioral"
                  ? "border-cyan-300/30 bg-cyan-300/10"
                  : "border-white/10 bg-[#0d141b] hover:bg-white/[0.04]"
              }`}
            >
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Mode two</p>
              <p className="mt-2 text-xl font-semibold text-white">Behavioral</p>
              <p className="mt-2 text-sm text-slate-400">
                {behavIndex}/{behavioralQs.length} completed
              </p>
            </button>
          </div>

          {isDone && (
            <Card className="rounded-[32px] border-white/10 bg-[#0d141b]">
              <CardContent className="space-y-4 py-12 text-center">
                <p className="text-2xl font-semibold text-white">
                  {mode === "technical" ? "Technical" : "Behavioral"} questions complete
                </p>
                <p className="text-slate-400">
                  Switch modes to continue the session or head back to the dashboard.
                </p>
                <div className="flex flex-col justify-center gap-3 md:flex-row">
                  <Button
                    className="h-12 rounded-2xl bg-emerald-400 px-6 text-base font-semibold text-[#092014] hover:bg-emerald-300"
                    onClick={() =>
                      switchMode(mode === "technical" ? "behavioral" : "technical")
                    }
                  >
                    Switch to {mode === "technical" ? "Behavioral" : "Technical"}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 rounded-2xl border-white/10 bg-transparent px-6 text-slate-100 hover:bg-white/5"
                    onClick={() => router.push("/dashboard")}
                  >
                    Return to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!isDone && (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-6">
                <Card className="rounded-[32px] border-white/10 bg-[#0d141b]">
                  <CardHeader className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Question progress
                        </p>
                        <p className="mt-2 text-sm text-slate-300">
                          Question {index + 1} of {questions.length}
                          {inFollowup ? " - Follow-up" : ""}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          mode === "technical"
                            ? "bg-emerald-300/12 text-emerald-100"
                            : "bg-cyan-300/12 text-cyan-100"
                        }`}
                      >
                        {mode === "technical" ? "Technical" : "Behavioral"}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.06]">
                      <div
                        className="h-2 rounded-full bg-emerald-300 transition-all"
                        style={{ width: `${((index + 1) / Math.max(questions.length, 1)) * 100}%` }}
                      />
                    </div>
                  </CardHeader>
                </Card>

                <Card className="rounded-[32px] border-white/10 bg-[#0d141b]">
                  <CardHeader className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CardTitle className="flex-1 text-2xl leading-tight text-white">
                        {inFollowup ? followup : currentQuestion}
                      </CardTitle>
                      {language !== "asl" && currentQuestion && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-11 w-11 rounded-2xl text-slate-300 hover:bg-white/[0.06] hover:text-white"
                          disabled={isSpeaking}
                          onClick={() => speak(inFollowup && followup ? followup : currentQuestion)}
                          title="Replay question"
                        >
                          <Volume2
                            className={`h-5 w-5 ${isSpeaking ? "animate-pulse text-emerald-200" : ""}`}
                          />
                        </Button>
                      )}
                    </div>
                    {inFollowup && (
                      <CardDescription className="text-base text-slate-400">
                        Follow-up based on your previous answer.
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <textarea
                      className="min-h-[180px] w-full resize-none rounded-[24px] border border-white/10 bg-[#081017] px-4 py-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300"
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
                          className="h-11 rounded-2xl border-white/10 bg-transparent px-4 text-slate-100 hover:bg-white/5"
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
                        className="h-11 rounded-2xl px-4 text-slate-400 hover:bg-white/[0.05] hover:text-white"
                      >
                        Skip
                      </Button>

                      <Button
                        onClick={handleSubmit}
                        disabled={!answer.trim() || isSubmitting}
                        className="ml-auto h-11 rounded-2xl bg-emerald-400 px-5 font-semibold text-[#092014] hover:bg-emerald-300"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {isSubmitting ? "Processing..." : inFollowup ? "Next Question" : "Submit"}
                      </Button>
                    </div>

                    {isRecording && (
                      <p className="text-sm text-emerald-200">
                        Recording is active. Speak naturally and we&apos;ll fill the answer box.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {language === "asl" && (
                  <Card className="rounded-[32px] border-white/10 bg-[#0d141b]">
                    <CardHeader>
                      <CardTitle className="text-white">ASL Recognition</CardTitle>
                      <CardDescription className="leading-7 text-slate-400">
                        Sign into the camera. Use the controls below to manage your signing session.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!camGranted ? (
                        <Button
                          className="h-12 w-full rounded-2xl bg-emerald-400 text-base font-semibold text-[#092014] hover:bg-emerald-300"
                          onClick={startCamera}
                        >
                          <Video className="mr-2 h-5 w-5" />
                          Enable Camera for ASL
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="aspect-video w-full object-cover"
                            />
                            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                                isAslProcessing ? 'bg-emerald-400/90 text-[#092014]' : 'bg-red-400/90 text-white'
                              }`}>
                                <span className={`h-2 w-2 rounded-full ${isAslProcessing ? 'animate-pulse bg-white' : 'bg-red-200'}`} />
                                {isAslProcessing ? 'Processing' : 'Inactive'}
                              </span>
                            </div>
                          </div>

                          {/* ASL Recognition Display */}
                          <div className="rounded-[16px] border border-white/10 bg-[#081017] p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-slate-300">Recognized Text</span>
                              <span className="text-xs text-slate-500">
                                Confidence: {Math.round(aslConfidence * 100)}%
                              </span>
                            </div>
                            <div className="min-h-[60px] rounded bg-black/20 p-3 text-lg font-mono text-emerald-200">
                              {aslText || <span className="text-slate-500">Start signing...</span>}
                            </div>
                            {aslLastSign && (
                              <div className="mt-2 text-xs text-slate-400">
                                Last sign: <span className="font-medium text-emerald-300">{aslLastSign}</span>
                              </div>
                            )}
                          </div>

                          {/* ASL Controls */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={resetAslBuffer}
                              className="flex-1 rounded-xl border-white/10 bg-transparent text-slate-300 hover:bg-white/5"
                            >
                              Clear Text
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (aslText.trim()) {
                                  setAnswer(prev => prev + (prev ? ' ' : '') + aslText.trim());
                                  resetAslBuffer();
                                }
                              }}
                              className="flex-1 rounded-xl border-emerald-300/30 bg-emerald-300/10 text-emerald-200 hover:bg-emerald-300/20"
                            >
                              Add to Answer
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card className="rounded-[32px] border-white/10 bg-[#0d141b]">
                  <CardHeader>
                    <CardTitle className="text-white">Session guide</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm leading-7 text-slate-400">
                    <p>Technical questions are grounded in your uploaded resume content.</p>
                    <p>Behavioral questions test clarity, decision-making, and communication.</p>
                    <p>Use `Ctrl+Enter` or `Cmd+Enter` to submit quickly from the answer box.</p>
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
