import os
import sys
import re
import json
import pickle
import tempfile
import base64
import asyncio
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import List, Dict, Optional

import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Add parent directory to path to import modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from rag.parser import parse_resume
from rag.vectorstore import build_vectorstore, query as query_vectorstore
from rag.interviewer import get_client, generate_questions, generate_followup, translate_questions
from tts import speak

# Global thread executor for ASL processing
_asl_executor = ThreadPoolExecutor(max_workers=2)

# Try to import ASL dependencies
ASL_AVAILABLE = False
HandDetector = None
GestureClassifier = None
LetterBuffer = None

try:
    from asl.detector import HandDetector
    from asl.classifier import SignClassifier as GestureClassifier
    from asl.buffer import SignBuffer as LetterBuffer
    ASL_AVAILABLE = True
    print("✓ ASL dependencies loaded successfully")
except ImportError as e:
    print(f"⚠️  ASL dependencies not available: {e}")

load_dotenv()

app = FastAPI(title="Smart Interview API - Full Integrated Version")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global states
interview_sessions: Dict[str, Dict] = {}
_asl_sessions: Dict[str, "ASLSession"] = {}

# ── ML models for resume screening ───────────────────────────────────────────
_MODELS_DIR = Path(__file__).parent.parent / "models"

def _load_screening_models():
    try:
        return {
            "cat_clf":   pickle.load(open(_MODELS_DIR / "rf_classifier_categorization.pkl", "rb")),
            "cat_tfidf": pickle.load(open(_MODELS_DIR / "tfidf_vectorizer_categorization.pkl", "rb")),
            "job_clf":   pickle.load(open(_MODELS_DIR / "rf_classifier_job_recommendation.pkl", "rb")),
            "job_tfidf": pickle.load(open(_MODELS_DIR / "tfidf_vectorizer_job_recommendation.pkl", "rb")),
        }
    except Exception as e:
        print(f"[screener] Could not load ML models: {e}")
        return None

_screening_models = _load_screening_models()

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
    audio_base64: Optional[str]

class ScreenResumeRequest(BaseModel):
    chunks: List[Dict]

class ASLFrameRequest(BaseModel):
    session_id: str
    frame: str 
    width: int = 640
    height: int = 480
    is_rgb: bool = True

class ASLFrameResponse(BaseModel):
    letter: Optional[str]
    confidence: float
    buffer: str
    last_sign: str
    annotated_frame: Optional[str]

# ═══════════════════════════════════════════════════════════════════════════
# ASL Session Manager (High Quality Spec)
# ═══════════════════════════════════════════════════════════════════════════

class ASLSession:
    def __init__(self):
        self.detector = HandDetector(max_hands=1)
        self.classifier = GestureClassifier()
        self.buffer = LetterBuffer()
        self.frame_count = 0

    def process_frame(self, frame_bgr: np.ndarray) -> dict:
        # Quality Lock: Ensure 640x480 for detection accuracy
        frame_bgr = cv2.resize(frame_bgr, (640, 480))
        
        features, annotated = self.detector.extract(frame_bgr)
        letter, confidence = None, 0.0

        if features is not None:
            letter, confidence = self.classifier.predict(features)
            self.buffer.push(letter, confidence)
            
            color = (0, 255, 100) if confidence >= 0.3 else (0, 180, 255)
            cv2.putText(annotated, f"{letter}  {confidence:.0%}", (12, 44),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 2)

        # Black Bar Buffer (Streamlit Style)
        display_text = self.buffer.text[-60:]
        cv2.rectangle(annotated, (0, annotated.shape[0] - 50),
                      (annotated.shape[1], annotated.shape[0]), (0, 0, 0), -1)
        cv2.putText(annotated, display_text, (10, annotated.shape[0] - 14),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)

        # Encode Frame (Quality 85 for clarity)
        _, buf_img = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 85])
        annotated_b64 = base64.b64encode(buf_img).decode("utf-8")

        return {
            "letter": letter,
            "confidence": float(confidence) if confidence else 0.0,
            "buffer": self.buffer.text,
            "last_sign": self.buffer.last_sign,
            "annotated_frame": annotated_b64,
        }

    def reset(self):
        self.buffer.reset()
        self.frame_count = 0

    def close(self):
        if hasattr(self.detector, 'close'):
            self.detector.close()

# ═══════════════════════════════════════════════════════════════════════════
# Resume, RAG & Interview Endpoints
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/parse-resume", response_model=ParsedResume)
async def parse_resume_endpoint(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        chunks = parse_resume(tmp_path)
        os.unlink(tmp_path)
        if not chunks:
            raise HTTPException(status_code=400, detail="Could not extract text")
        
        # Field Extraction
        full_text = " ".join([c["text"] for c in chunks])
        fields = {"name": "", "email": "", "phone": ""}
        email_m = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', full_text)
        if email_m: fields["email"] = email_m.group(0)
        
        lines = full_text.split('\n')
        for line in lines[:5]:
            words = line.strip().split()
            if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w):
                fields["name"] = line.strip()
                break
        
        return ParsedResume(fields=fields, chunks=chunks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-questions", response_model=QuestionsResponse)
async def generate_questions_endpoint(request: GenerateQuestionsRequest):
    try:
        groq_client = get_client()
        language = request.language.lower()
        technical_qs = generate_questions(request.chunks, groq_client, language=language)
        
        behavioral_path = Path(__file__).parent.parent / "data" / "behavioral_questions.json"
        with open(behavioral_path, "r", encoding="utf-8") as f:
            behavioral_data = json.load(f)
        
        import random
        sampled = random.sample(behavioral_data["questions"], min(5, len(behavioral_data["questions"])))
        behavioral_texts = [q["question"] for q in sampled]

        if language != "english":
            behavioral_texts = translate_questions(behavioral_texts, groq_client, target_language=language)

        behavioral_qs = [{"id": i, "question": q, "category": sampled[i].get("category", ""), "difficulty": sampled[i].get("difficulty", "")}
                         for i, q in enumerate(behavioral_texts)]

        return QuestionsResponse(technical_questions=technical_qs, behavioral_questions=behavioral_qs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/interview/process", response_model=ProcessAnswerResponse)
async def process_answer_endpoint(request: ProcessAnswerRequest):
    try:
        if request.session_id not in interview_sessions:
            interview_sessions[request.session_id] = {"collection": None, "groq": get_client()}
        session = interview_sessions[request.session_id]
        context = query_vectorstore(session["collection"], request.question + " " + request.answer) if session["collection"] else []
        followup = generate_followup(request.question, request.answer, context, session["groq"], language=request.language)
        
        audio_base64 = None
        if request.language.lower() != "asl":
            audio_bytes = speak(followup, language=request.language)
            if audio_bytes: audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')

        return ProcessAnswerResponse(followup_question=followup, audio_base64=audio_base64)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/interview/init-session")
async def init_interview_session(session_id: str, chunks: List[Dict]):
    try:
        collection = build_vectorstore(chunks)
        interview_sessions[session_id] = {"collection": collection, "groq": get_client()}
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ═══════════════════════════════════════════════════════════════════════════
# ASL Endpoints (Updated with WebSocket and HTTP fixes)
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/asl/process-frame", response_model=ASLFrameResponse)
async def asl_process_frame(request: ASLFrameRequest):
    if not ASL_AVAILABLE:
        raise HTTPException(status_code=503, detail="ASL unavailable")
    try:
        if request.session_id not in _asl_sessions:
            _asl_sessions[request.session_id] = ASLSession()
        session = _asl_sessions[request.session_id]

        raw = request.frame
        if "," in raw: raw = raw.split(",")[1]
        frame_bytes = base64.b64decode(raw)
        nparr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None: raise HTTPException(status_code=400, detail="Invalid image")
        if request.is_rgb: frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(_asl_executor, session.process_frame, frame)
        return ASLFrameResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/asl/stream")
async def asl_websocket_stream(websocket: WebSocket):
    if not ASL_AVAILABLE:
        await websocket.close(code=1003)
        return
    await websocket.accept()
    session_id = None
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "init":
                session_id = data["session_id"]
                if session_id not in _asl_sessions:
                    _asl_sessions[session_id] = ASLSession()
                await websocket.send_json({"type": "ready"})
                continue
            
            if data.get("type") == "frame" and session_id:
                raw = data["frame"].split(",")[1] if "," in data["frame"] else data["frame"]
                frame_bytes = base64.b64decode(raw)
                nparr = np.frombuffer(frame_bytes, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if frame is not None:
                    if data.get("is_rgb", True): frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
                    loop = asyncio.get_event_loop()
                    result = await loop.run_in_executor(_asl_executor, _asl_sessions[session_id].process_frame, frame)
                    await websocket.send_json({"type": "result", **result})
            elif data.get("type") == "reset" and session_id:
                _asl_sessions[session_id].reset()
    except WebSocketDisconnect:
        if session_id in _asl_sessions:
            _asl_sessions[session_id].close()
            del _asl_sessions[session_id]

@app.post("/asl/reset")
async def asl_reset_session(session_id: str):
    if session_id in _asl_sessions: _asl_sessions[session_id].reset()
    return {"status": "success"}

# ═══════════════════════════════════════════════════════════════════════════
# Screening, TTS & Signapse Endpoints
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/screen-resume")
async def screen_resume(request: ScreenResumeRequest):
    if not _screening_models: raise HTTPException(status_code=503, detail="Models not loaded")
    full_text = " ".join(c.get("text", "") for c in request.chunks)
    cleaned = re.sub(r'\s+', ' ', re.sub(r'[^\x00-\x7f]', ' ', full_text)).strip()
    
    cat_vec = _screening_models["cat_tfidf"].transform([cleaned])
    category = _screening_models["cat_clf"].predict(cat_vec)[0]
    job_vec = _screening_models["job_tfidf"].transform([cleaned])
    recommended_job = _screening_models["job_clf"].predict(job_vec)[0]

    return {"category": category, "recommended_job": recommended_job}

@app.post("/tts")
async def tts_endpoint(request: Dict):
    audio_bytes = speak(request.get("text"), language=request.get("language", "english"))
    if not audio_bytes: raise HTTPException(status_code=503, detail="TTS error")
    return {"audio_base64": base64.b64encode(audio_bytes).decode("utf-8")}

@app.post("/sign-question")
async def sign_question_endpoint(request: Dict):
    import requests as _requests
    resp = _requests.post(os.getenv("SIGNAPSE_API_URL"), 
                         json={"text": request.get("text")}, 
                         headers={"Authorization": f"Bearer {os.getenv('SIGNAPSE_API_KEY')}"})
    return resp.json()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "asl_available": ASL_AVAILABLE}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)