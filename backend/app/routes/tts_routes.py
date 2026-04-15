import os
from fastapi import APIRouter, Query
from fastapi.responses import FileResponse
from fastapi import HTTPException

from app.services.emotion import detect_emotion
from app.services.mapper import map_emotion_to_voice
from app.services.tts import generate_speech

router = APIRouter()

@router.post("/speak")
def speak(text: str = Query(..., description="Input text")):
    
    # 1. Detect emotion
    emotion, score = detect_emotion(text)

    # 2. Map to voice params
    rate, volume = map_emotion_to_voice(emotion, score)

    # 3. Generate speech
    audio_path = generate_speech(text, rate, volume)

    filename = os.path.basename(audio_path)
    return {
        "input_text": text,
        "emotion": emotion,
        "confidence": round(score, 3),
        "rate": rate,
        "volume": round(volume, 2),
        "audio_file": filename   # ✅ only filename
        }


    

AUDIO_DIR = "static/audio"


@router.get("/get-audio")
def get_audio(filename: str = Query(...)):
    file_path = os.path.join(AUDIO_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=file_path,
        media_type="audio/wav",
        filename=filename
    )