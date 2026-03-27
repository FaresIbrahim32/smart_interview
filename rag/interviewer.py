import os
import re
import random
from groq import Groq


def get_client() -> Groq:
    return Groq(api_key=os.getenv("RAG_API"))


_INTERVIEWER_PERSONAS = [
    "a startup CTO who cares about pragmatic engineering decisions and speed of execution",
    "a staff engineer at a big tech company who digs deep into system design and scalability",
    "a senior engineer who focuses on code quality, testing, and maintainability",
    "a tech lead who is especially curious about collaboration, debugging stories, and lessons learned",
    "a principal engineer who challenges assumptions and asks about trade-offs and alternatives",
]


def generate_questions(chunks: list[dict], client: Groq) -> list[str]:
    # Shuffle chunks so different runs surface different details to the LLM
    shuffled = chunks[:]
    random.shuffle(shuffled)

    sections: dict[str, list[str]] = {}
    for chunk in shuffled:
        sec = chunk["section"]
        sections.setdefault(sec, []).append(chunk["text"])

    resume_text = "\n\n".join(
        f"[{sec.upper()}]\n" + "\n".join(texts)
        for sec, texts in sections.items()
    )

    persona = random.choice(_INTERVIEWER_PERSONAS)

    prompt = f"""You are {persona}, conducting a real technical interview.
Based on the candidate's resume below, generate exactly 8 interview questions.

Rules:
- Reference specific project names, technologies, companies, or roles from the resume
- Ask about implementation details, trade-offs, challenges, and outcomes
- Let your persona shape the angle — what would YOU specifically want to dig into?
- Make questions feel like a real human interviewer asked them (not generic)
- Do NOT ask yes/no questions
- Do NOT repeat similar questions

Resume:
{resume_text}

Return ONLY a numbered list (1. 2. 3. ...) of questions, nothing else."""

    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=1.0,
        max_tokens=800,
    )

    lines = resp.choices[0].message.content.strip().split("\n")
    questions = []
    for line in lines:
        line = line.strip()
        if line and line[0].isdigit() and ("." in line or ")" in line):
            q = re.split(r"^[\d]+[.)]\s*", line, maxsplit=1)
            questions.append(q[-1].strip() if len(q) > 1 else line)
    return questions


def generate_followup(question: str, answer: str, context: list[str], client: Groq) -> str:
    context_text = "\n".join(context)

    prompt = f"""You are a technical interviewer. The candidate just answered your question.

Your question: {question}
Their answer: {answer}
Resume context: {context_text}

Ask ONE natural follow-up question that probes deeper. If their answer was vague, ask for specifics.
If they were technical, explore edge cases or trade-offs. Keep it conversational.

Return ONLY the follow-up question."""

    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.9,
        max_tokens=150,
    )

    return resp.choices[0].message.content.strip()
