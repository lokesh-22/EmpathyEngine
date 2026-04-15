import os
import uuid

from fastapi import APIRouter, Query
from google.api_core.client_options import ClientOptions
from google.cloud import texttospeech

from app.config import GOOGLE_API_KEY, GOOGLE_APPLICATION_CREDENTIALS
from app.services.emotion import detect_emotion
from app.services.text_enhancer import add_pauses, enhance_text_for_emotion

OUTPUT_DIR = "static/audio"
os.makedirs(OUTPUT_DIR, exist_ok=True)

router = APIRouter()


def _get_google_client():
    if GOOGLE_APPLICATION_CREDENTIALS:
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_APPLICATION_CREDENTIALS
        return texttospeech.TextToSpeechClient()

    if GOOGLE_API_KEY:
        return texttospeech.TextToSpeechClient(
            client_options=ClientOptions(api_key=GOOGLE_API_KEY)
        )

    raise RuntimeError(
        "Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_API_KEY in backend/.env"
    )


def generate_speech_google(text: str, emotion: str):
    client = _get_google_client()
    filename = f"{uuid.uuid4()}.mp3"
    filepath = os.path.join(OUTPUT_DIR, filename)

    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        name="en-US-Neural2-F",
    )

    pitch = 0.0
    speaking_rate = 1.0

    if emotion == "joy":
        pitch = 4.0
        speaking_rate = 1.15
    elif emotion == "sadness":
        pitch = -4.0
        speaking_rate = 0.85
    elif emotion == "anger":
        pitch = 2.0
        speaking_rate = 1.2
    elif emotion == "fear":
        pitch = -2.0
        speaking_rate = 0.9

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        speaking_rate=speaking_rate,
        pitch=pitch,
    )

    synthesis_input = texttospeech.SynthesisInput(text=text)

    response = client.synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config,
    )

    with open(filepath, "wb") as out:
        out.write(response.audio_content)

    return filepath


@router.post("/speak/google")
def speak_google(text: str = Query(..., description="Input text")):
    emotion, score = detect_emotion(text)

    enhanced_text = enhance_text_for_emotion(text, emotion)
    enhanced_text = add_pauses(enhanced_text, emotion)

    audio_path = generate_speech_google(enhanced_text, emotion)
    filename = os.path.basename(audio_path)

    return {
        "input_text": enhanced_text,
        "emotion": emotion,
        "confidence": round(score, 3),
        "audio_file": filename,
        "provider": "google",
        "playback_format": "mp3",
    }
