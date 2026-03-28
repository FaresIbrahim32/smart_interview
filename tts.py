"""
tts.py  —  ElevenLabs text-to-speech helper

Usage:
    from tts import speak

    audio_bytes = speak("Tell me about yourself.")
    if audio_bytes:
        st.audio(audio_bytes, format="audio/mpeg", autoplay=True)

Env vars (in .env):
    ELEVENLABS_API_KEY   — required
    ELEVENLABS_VOICE_ID  — optional, defaults to Rachel (professional/neutral)
"""

import os
import requests

# Rachel — professional, neutral, clear American English
_DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"

_ELEVENLABS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"


def speak(text: str) -> bytes | None:
    """
    Convert text to speech via ElevenLabs.
    Returns raw audio bytes (MP3) or None if TTS is unavailable.
    """
    api_key = os.getenv("ELEVEN_API")
    if not api_key:
        return None  # TTS simply disabled if no key

    voice_id = os.getenv("ELEVENLABS_VOICE_ID", _DEFAULT_VOICE_ID)
    url = _ELEVENLABS_URL.format(voice_id=voice_id)

    try:
        response = requests.post(
            url,
            headers={
                "xi-api-key": api_key,
                "Content-Type": "application/json",
                "Accept": "audio/mpeg",
            },
            json={
                "text": text.strip(),
                "model_id": "eleven_turbo_v2",
                "voice_settings": {
                    "stability": 0.55,
                    "similarity_boost": 0.75,
                    "style": 0.0,
                    "use_speaker_boost": True,
                },
            },
            timeout=15,
        )
        response.raise_for_status()
        return response.content
    except Exception as e:
        print(f"[tts] ElevenLabs error: {e}")
        return None
