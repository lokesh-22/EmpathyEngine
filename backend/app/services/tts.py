import pyttsx3
import uuid
import os
import time

OUTPUT_DIR = "static/audio"

def generate_speech(text, rate, volume):
    engine = pyttsx3.init()

    engine.setProperty('rate', rate)
    engine.setProperty('volume', volume)

    filename = f"{uuid.uuid4()}.wav"
    filepath = os.path.join(OUTPUT_DIR, filename)

    engine.save_to_file(text, filepath)
    engine.runAndWait()

    # 🔥 IMPORTANT: ensure file is written
    time.sleep(0.5)

    # 🔥 Check file size
    if os.path.exists(filepath):
        size = os.path.getsize(filepath)
        print("Generated file size:", size)

    return filepath