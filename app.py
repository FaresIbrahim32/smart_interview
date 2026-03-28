import streamlit as st
import tempfile
import os
import json
import random
from dotenv import load_dotenv

load_dotenv()

from rag.parser import parse_resume
from rag.vectorstore import build_vectorstore, query
from rag.interviewer import get_client, generate_questions, generate_followup
from tts import speak

st.set_page_config(page_title="Smart Interview", layout="centered")
st.title("Smart Interview")
st.caption("Upload your resume and get interviewed on your actual experience.")

# ── Session state defaults ────────────────────────────────────────────────────
for key, default in {
    "questions": [],
    "q_index": 0,
    "history": [],
    "collection": None,
    "groq": None,
    "awaiting_followup": False,
    "followup_q": "",
    "last_spoken": "",          # track which question was last sent to TTS
}.items():
    if key not in st.session_state:
        st.session_state[key] = default


# ── TTS helper (cached per question text) ────────────────────────────────────
@st.cache_data(show_spinner=False)
def get_audio(text: str) -> bytes | None:
    return speak(text)


# ── Tabs ──────────────────────────────────────────────────────────────────────
tab_resume, tab_behavioral = st.tabs(["Resume Interview", "Behavioral Questions"])


# ════════════════════════════════════════════════════════════════════════════
# TAB 1 — Resume-based interview (RAG)
# ════════════════════════════════════════════════════════════════════════════
with tab_resume:

    # ── Upload screen ─────────────────────────────────────────────────────────
    if not st.session_state.questions:
        uploaded = st.file_uploader("Upload your resume (PDF)", type=["pdf"])

        if uploaded:
            with st.spinner("Reading resume and generating questions..."):
                with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                    tmp.write(uploaded.read())
                    tmp_path = tmp.name

                chunks = parse_resume(tmp_path)
                os.unlink(tmp_path)

                if not chunks:
                    st.error("Couldn't extract text. Make sure your PDF is not a scanned image.")
                    st.stop()

                st.session_state.collection = build_vectorstore(chunks)
                st.session_state.groq = get_client()
                st.session_state.questions = generate_questions(chunks, st.session_state.groq)
                st.session_state.last_spoken = ""

            st.rerun()

        st.stop()

    # ── Interview screen ───────────────────────────────────────────────────────
    questions = st.session_state.questions
    idx = st.session_state.q_index
    total = len(questions)

    st.progress(idx / total, text=f"Question {min(idx + 1, total)} of {total}")

    # Render chat history
    for msg in st.session_state.history:
        role = "assistant" if msg["role"] == "interviewer" else "user"
        with st.chat_message(role):
            st.write(msg["text"])

    # ── Session complete ───────────────────────────────────────────────────────
    if idx >= total:
        st.success("That's a wrap! Great practice session.")
        if st.button("Start over"):
            for k in ["questions", "q_index", "history", "collection", "groq",
                      "awaiting_followup", "followup_q", "last_spoken"]:
                del st.session_state[k]
            st.rerun()
        st.stop()

    # ── Current question ───────────────────────────────────────────────────────
    current_q = (
        st.session_state.followup_q
        if st.session_state.awaiting_followup
        else questions[idx]
    )

    # Show question in chat bubble if not yet displayed
    if not st.session_state.history or st.session_state.history[-1]["role"] != "interviewer":
        with st.chat_message("assistant"):
            st.write(current_q)

# ── TTS: read question aloud ───────────────────────────────────────────────
    if st.button("🔊 Read question aloud", key=f"tts_{idx}_{st.session_state.awaiting_followup}"):
        audio = get_audio(current_q)
        if audio:
            st.audio(audio, format="audio/mpeg", autoplay=True)
        else:
            st.warning("TTS unavailable — check your ELEVENLABS_API_KEY in .env")

    # ── Answer input ───────────────────────────────────────────────────────────
    answer = st.chat_input("Your answer…")

    if answer:
        st.session_state.history.append({"role": "interviewer", "text": current_q})
        st.session_state.history.append({"role": "candidate", "text": answer})

        context = query(st.session_state.collection, current_q + " " + answer)

        if not st.session_state.awaiting_followup:
            followup = generate_followup(current_q, answer, context, st.session_state.groq)
            st.session_state.followup_q = followup
            st.session_state.awaiting_followup = True
        else:
            st.session_state.awaiting_followup = False
            st.session_state.followup_q = ""
            st.session_state.q_index += 1

        st.rerun()

    # ── Sidebar ────────────────────────────────────────────────────────────────
    with st.sidebar:
        st.header("Session")
        if st.button("Upload new resume"):
            for k in ["questions", "q_index", "history", "collection", "groq",
                      "awaiting_followup", "followup_q", "last_spoken"]:
                del st.session_state[k]
            st.rerun()

        st.divider()
        st.subheader("All questions")
        for i, q in enumerate(questions):
            prefix = "✅" if i < idx else ("▶" if i == idx else "○")
            st.caption(f"{prefix} {i+1}. {q[:70]}{'…' if len(q) > 70 else ''}")


# ════════════════════════════════════════════════════════════════════════════
# TAB 2 — Behavioral questions
# ════════════════════════════════════════════════════════════════════════════
with tab_behavioral:

    # ── Load behavioral questions ─────────────────────────────────────────────
    @st.cache_data
    def load_behavioral() -> list[dict]:
        data_path = os.path.join(os.path.dirname(__file__), "data", "behavioral_questions.json")
        with open(data_path, "r", encoding="utf-8") as f:
            return json.load(f)["questions"]

    all_bq = load_behavioral()

    # ── Filters ───────────────────────────────────────────────────────────────
    categories = sorted({q["category"] for q in all_bq})
    difficulties = ["beginner", "intermediate", "advanced"]

    col1, col2 = st.columns(2)
    with col1:
        selected_cat = st.selectbox(
            "Category",
            ["All"] + categories,
            format_func=lambda x: x.replace("_", " ").title(),
        )
    with col2:
        selected_diff = st.selectbox("Difficulty", ["All"] + difficulties)

    # ── Filter + pick a random question ──────────────────────────────────────
    filtered = [
        q for q in all_bq
        if (selected_cat == "All" or q["category"] == selected_cat)
        and (selected_diff == "All" or q["difficulty"] == selected_diff)
    ]

    if "bq_current" not in st.session_state:
        st.session_state.bq_current = random.choice(filtered) if filtered else None

    # Re-pick when filters change
    filter_key = f"{selected_cat}_{selected_diff}"
    if st.session_state.get("bq_filter_key") != filter_key:
        st.session_state.bq_filter_key = filter_key
        st.session_state.bq_current = random.choice(filtered) if filtered else None

    # ── Display current question ──────────────────────────────────────────────
    bq = st.session_state.bq_current

    if not filtered:
        st.info("No questions match the selected filters.")
    else:
        st.markdown(f"### {bq['question']}")

        meta_cols = st.columns(3)
        meta_cols[0].caption(f"📂 {bq['category'].replace('_', ' ').title()}")
        meta_cols[1].caption(f"📊 {bq['difficulty'].title()}")
        meta_cols[2].caption(f"⭐ STAR method: {'Yes' if bq['star_method'] else 'No'}")

        # TTS button for behavioral question
        if st.button("🔊 Read question aloud"):
            audio = get_audio(bq["question"])
            if audio:
                st.audio(audio, format="audio/mpeg", autoplay=True)
            else:
                st.warning("TTS unavailable — check your ELEVENLABS_API_KEY in .env")

        st.divider()

        if st.button("Next question →"):
            remaining = [q for q in filtered if q["id"] != bq["id"]]
            st.session_state.bq_current = random.choice(remaining) if remaining else bq
            st.rerun()

        st.caption(f"{len(filtered)} question(s) available with current filters.")