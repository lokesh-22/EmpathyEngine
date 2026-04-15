import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("ELEVENLABS_API_KEY")

url = "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM"

payload = {
    "text": "Hello, this is a test of Eleven Labs API.",
    "voice_settings": {
        "stability": 0.5,
        "similarity_boost": 0.8,
        "style": 0.5
    }
}

headers = {
    "xi-api-key": API_KEY,
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print("Status Code:", response.status_code)
print("Content-Type:", response.headers.get("Content-Type"))

# 🔥 Handle response properly
if response.status_code == 200:
    with open("test_output.mp3", "wb") as f:
        f.write(response.content)
    print("✅ Audio generated: test_output.mp3")
else:
    print("❌ ERROR RESPONSE:")
    print(response.text)