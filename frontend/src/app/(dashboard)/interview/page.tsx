"use client";

import { useState } from "react";
import VoiceInterviewUI from "./VoiceInterviewUI";
import ASLInterviewUI from "./ASLInterviewUI";

type Language = "english" | "spanish" | "asl";

export default function InterviewPage() {
  const [language, setLanguage] = useState<Language>("english");

  return (
    <>
      {/* GLOBAL HEADER (shared) */}
      <div className="p-4 flex justify-between items-center border-b">
        <h1 className="font-bold">Smart Interview AI</h1>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="border p-2 rounded"
        >
          <option value="english">English</option>
          <option value="spanish">Spanish</option>
          <option value="asl">ASL</option>
        </select>
      </div>

      {/* 🔥 THE SWITCH */}
      {language === "asl" ? (
        <ASLInterviewUI setLanguage={setLanguage} />
      ) : (
        <VoiceInterviewUI
          language={language}
          setLanguage={setLanguage}
        />
      )}
    </>
  );
}