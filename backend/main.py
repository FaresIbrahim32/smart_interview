"""
FastAPI Backend for Smart Interview Application

This backend connects the Next.js frontend with the Python RAG/ASL/TTS modules.
Endpoints:
- POST /parse-resume: Parse resume PDF and extract fields
- POST /generate-questions: Generate technical + behavioral questions
- POST /interview/process: Process answer and generate follow-up with TTS
- WebSocket /asl/recognize: Real-time ASL recognition
"""

import os
import sys
import json
import tempfile
import base64
from pathlib import Path
from typing import List, Dict, Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Add parent directory to path to import modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from rag.parser import parse_resume
from rag.vectorstore import build_vectorstore, query as query_vectorstore
from rag.interviewer import get_client, generate_questions, generate_followup
from tts import speak

# Try to import ASL dependencies (optional - requires Python 3.8-3.12)
ASL_AVAILABLE = False
try:
    import numpy as np
    import cv2
    from asl.detector import HandDetector
    from asl.classifier import GestureClassifier
    from asl.buffer import LetterBuffer
    ASL_AVAILABLE = True
except ImportError:
    print("⚠️  ASL dependencies not available. ASL mode disabled.")
    print("   To enable: Use Python 3.8-3.12, uncomment ASL deps in requirements.txt, pip install")

load_dotenv()

app = FastAPI(title="Smart Interview API")

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state for interview sessions
interview_sessions: Dict[str, Dict] = {}

# ═══════════════════════════════════════════════════════════════════════════
# Request/Response Models
# ═══════════════════════════════════════════════════════════════════════════

class ParsedResume(BaseModel):
    fields: Dict[str, str]
    chunks: List[Dict[str, str]]

class GenerateQuestionsRequest(BaseModel):
    chunks: List[Dict[str, str]]
    language: str = "english"

class QuestionsResponse(BaseModel):
    technical_questions: List[str]
    behavioral_questions: List[Dict]

class ProcessAnswerRequest(BaseModel):
    session_id: str
    question: str
    answer: str
    language: str = "english"

class ProcessAnswerResponse(BaseModel):
    followup_question: Optional[str]
    audio_base64: Optional[str]  # Base64 encoded MP3 audio

# ═══════════════════════════════════════════════════════════════════════════
# Endpoint 1: Parse Resume
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/parse-resume", response_model=ParsedResume)
async def parse_resume_endpoint(file: UploadFile = File(...)):
    """
    Parse uploaded resume PDF and extract structured fields.
    Returns detected fields (name, email, etc.) and text chunks for RAG.
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        # Save uploaded file to temp location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Parse resume into chunks
        chunks = parse_resume(tmp_path)
        os.unlink(tmp_path)

        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF. Ensure it's not a scanned image."
            )

        # Extract basic fields from chunks
        fields = extract_fields_from_chunks(chunks)

        return ParsedResume(fields=fields, chunks=chunks)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {str(e)}")


def extract_fields_from_chunks(chunks: List[Dict]) -> Dict[str, str]:
    """
    Extract structured fields (name, email, phone, etc.) from resume chunks.
    This is a simple heuristic-based extraction.
    """
    import re

    fields = {
        "name": "",
        "email": "",
        "phone": "",
        "location": "",
        "linkedin": "",
        "github": "",
        "summary": ""
    }

    full_text = " ".join([c["text"] for c in chunks])

    # Email detection
    email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', full_text)
    if email_match:
        fields["email"] = email_match.group(0)

    # Phone detection
    phone_match = re.search(r'\b(?:\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})\b', full_text)
    if phone_match:
        fields["phone"] = phone_match.group(0)

    # LinkedIn detection
    linkedin_match = re.search(r'linkedin\.com/in/[\w-]+', full_text, re.IGNORECASE)
    if linkedin_match:
        fields["linkedin"] = linkedin_match.group(0)

    # GitHub detection
    github_match = re.search(r'github\.com/[\w-]+', full_text, re.IGNORECASE)
    if github_match:
        fields["github"] = github_match.group(0)

    # Name detection (heuristic: first line with 2-4 capitalized words)
    lines = full_text.split('\n')
    for line in lines[:5]:  # Check first 5 lines
        words = line.strip().split()
        if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w):
            fields["name"] = line.strip()
            break

    # Summary (first chunk from summary/objective section)
    for chunk in chunks:
        if chunk["section"] in ["summary", "objective", "about me", "profile"]:
            fields["summary"] = chunk["text"][:200]  # First 200 chars
            break

    return fields


# ═══════════════════════════════════════════════════════════════════════════
# Endpoint 2: Generate Questions
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/generate-questions", response_model=QuestionsResponse)
async def generate_questions_endpoint(request: GenerateQuestionsRequest):
    """
    Generate technical questions (RAG-based) and behavioral questions.
    Technical questions are generated from resume chunks.
    Behavioral questions are loaded from data/behavioral_questions.json.
    """
    try:
        # Generate technical questions using RAG
        groq_client = get_client()
        technical_qs = generate_questions(request.chunks, groq_client)

        # Load behavioral questions
        behavioral_path = Path(__file__).parent.parent / "data" / "behavioral_questions.json"
        with open(behavioral_path, "r", encoding="utf-8") as f:
            behavioral_data = json.load(f)
            behavioral_qs = behavioral_data["questions"]

        # Filter behavioral questions if needed (can add filtering logic here)
        # For now, return a random sample of 5 behavioral questions
        import random
        sampled_behavioral = random.sample(behavioral_qs, min(5, len(behavioral_qs)))

        return QuestionsResponse(
            technical_questions=technical_qs,
            behavioral_questions=sampled_behavioral
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")


# ═══════════════════════════════════════════════════════════════════════════
# Endpoint 3: Process Answer & Generate Follow-up
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/interview/process", response_model=ProcessAnswerResponse)
async def process_answer_endpoint(request: ProcessAnswerRequest):
    """
    Process candidate's answer and generate follow-up question.
    Includes TTS audio generation for voice/ASL modes.
    """
    try:
        # Get or create session
        if request.session_id not in interview_sessions:
            interview_sessions[request.session_id] = {
                "collection": None,
                "groq": get_client()
            }

        session = interview_sessions[request.session_id]

        # Query vectorstore for context (if collection exists)
        context = []
        if session["collection"]:
            context = query_vectorstore(
                session["collection"],
                request.question + " " + request.answer
            )

        # Generate follow-up question
        followup = generate_followup(
            request.question,
            request.answer,
            context,
            session["groq"]
        )

        # Generate TTS audio if language is not ASL
        audio_base64 = None
        if request.language.lower() != "asl":
            audio_bytes = speak(followup)
            if audio_bytes:
                audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')

        return ProcessAnswerResponse(
            followup_question=followup,
            audio_base64=audio_base64
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing answer: {str(e)}")


@app.post("/interview/init-session")
async def init_interview_session(session_id: str, chunks: List[Dict]):
    """
    Initialize an interview session with resume chunks for context retrieval.
    """
    try:
        collection = build_vectorstore(chunks)
        interview_sessions[session_id] = {
            "collection": collection,
            "groq": get_client()
        }
        return {"status": "success", "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initializing session: {str(e)}")


# ═══════════════════════════════════════════════════════════════════════════
# Endpoint 4: ASL Recognition WebSocket
# ═══════════════════════════════════════════════════════════════════════════

@app.websocket("/asl/recognize")
async def asl_recognition_websocket(websocket: WebSocket):
    """
    Real-time ASL recognition via WebSocket.
    Receives video frames, returns recognized letters/words.
    """
    await websocket.accept()

    if not ASL_AVAILABLE:
        await websocket.send_json({
            "error": "ASL recognition not available. Requires Python 3.8-3.12 with mediapipe installed."
        })
        await websocket.close()
        return

    # Initialize ASL components
    detector = HandDetector(max_hands=1)
    classifier = GestureClassifier()
    buffer = LetterBuffer(window_size=5, min_confidence=0.6)

    try:
        while True:
            # Receive frame as base64 encoded image
            data = await websocket.receive_json()
            frame_data = data.get("frame")

            if not frame_data:
                continue

            # Decode base64 frame
            frame_bytes = base64.b64decode(frame_data.split(',')[1] if ',' in frame_data else frame_data)
            nparr = np.frombuffer(frame_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            # Extract hand features
            features, annotated = detector.extract(frame)

            if features is not None:
                # Classify gesture
                letter, confidence = classifier.predict(features)

                # Add to buffer and get word if complete
                result = buffer.add(letter, confidence)

                # Encode annotated frame back to base64
                _, buffer_img = cv2.imencode('.jpg', annotated)
                annotated_b64 = base64.b64encode(buffer_img).decode('utf-8')

                # Send response
                await websocket.send_json({
                    "letter": letter,
                    "confidence": float(confidence),
                    "word": result.get("word") if result else None,
                    "buffer": buffer.get_current_text(),
                    "annotated_frame": annotated_b64
                })
            else:
                # No hand detected
                await websocket.send_json({
                    "letter": None,
                    "confidence": 0.0,
                    "word": None,
                    "buffer": buffer.get_current_text(),
                    "annotated_frame": None
                })

    except WebSocketDisconnect:
        detector.close()
        print(f"ASL WebSocket disconnected")
    except Exception as e:
        print(f"ASL WebSocket error: {e}")
        detector.close()
        await websocket.close()


# ═══════════════════════════════════════════════════════════════════════════
# Health Check
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Smart Interview API",
        "endpoints": [
            "POST /parse-resume",
            "POST /generate-questions",
            "POST /interview/process",
            "POST /interview/init-session",
            "WS /asl/recognize"
        ]
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
