import os
import shutil
import subprocess
import tempfile
from fastapi import APIRouter, Query
from fastapi.responses import FileResponse
from fastapi import HTTPException
from starlette.background import BackgroundTask

from app.services.emotion import detect_emotion
from app.services.mapper import map_emotion_to_voice, apply_variation
from app.services.tts import generate_speech

from app.services.text_enhancer import enhance_text_for_emotion, add_pauses

router = APIRouter()

@router.post("/speak")
def speak(text: str = Query(..., description="Input text")):
    
    # 1. Detect emotion
    emotion, score = detect_emotion(text)

    text = enhance_text_for_emotion(text, emotion)

    text = add_pauses(text, emotion)

    # 2. Map to voice params
    rate, volume = map_emotion_to_voice(emotion, score)

    rate, volume = apply_variation(rate, volume)
    

    # 3. Generate speech
    audio_path = generate_speech(text, rate, volume, emotion)
    
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


def _cleanup_file(path: str):
    if os.path.exists(path):
        os.remove(path)


def _convert_for_browser(source_path: str, target_format: str) -> tuple[str, str]:
    afconvert_path = shutil.which("afconvert")

    if not afconvert_path:
        raise HTTPException(status_code=500, detail="Audio converter not available")

    if target_format == "mp3":
        suffix = ".mp3"
        media_type = "audio/mpeg"
        command = [
            afconvert_path,
            "-f",
            "MPG3",
            "-d",
            ".mp3",
            source_path,
        ]
    else:
        suffix = ".wav"
        media_type = "audio/wav"
        command = [
            afconvert_path,
            "-f",
            "WAVE",
            "-d",
            "LEI16",
            source_path,
        ]

    temp_file = tempfile.NamedTemporaryFile(suffix=suffix, delete=False)
    temp_file.close()
    output_path = temp_file.name

    try:
        subprocess.run(
            [*command, output_path],
            check=True,
            capture_output=True,
            text=True,
        )
    except subprocess.CalledProcessError as error:
        _cleanup_file(output_path)
        raise HTTPException(status_code=500, detail=error.stderr.strip() or "Audio conversion failed")

    return output_path, media_type


@router.get("/get-audio")
def get_audio(
    filename: str = Query(...),
    format: str = Query("wav", pattern="^(mp3|wav)$"),
):
    file_path = os.path.join(AUDIO_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    playback_path, media_type = _convert_for_browser(file_path, format)
    download_name = f"{os.path.splitext(filename)[0]}.{format}"

    return FileResponse(
        path=playback_path,
        media_type=media_type,
        filename=download_name,
        background=BackgroundTask(_cleanup_file, playback_path),
    )
