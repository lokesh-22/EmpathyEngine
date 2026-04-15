# Empathy Engine

Empathy Engine is a full-stack text-to-speech project that tries to make spoken output feel more expressive.
The backend detects the emotion in a user's message, adjusts the text and voice settings, generates speech, and then serves audio to the frontend for playback.

## Project Structure

```text
EmpathyEngine/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── routes/
│   │   │   └── tts_routes.py
│   │   └── services/
│   │       ├── emotion.py
│   │       ├── mapper.py
│   │       ├── text_enhancer.py
│   │       └── tts.py
│   ├── requirements.txt
│   └── static/audio/
└── empathy-frontend/
    ├── src/
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

## How It Works

### Backend flow

1. The frontend sends text to `POST /speak`.
2. The backend classifies the text emotion using a Hugging Face Transformers model.
3. The text is lightly rewritten to better match the detected emotion.
4. The backend maps emotion intensity into `rate` and `volume`.
5. A small random variation is added so speech feels less robotic.
6. `pyttsx3` generates an audio file into `backend/static/audio/`.
7. The frontend requests `GET /get-audio?filename=...&format=wav`.
8. The backend converts the generated file into a browser-safe playback file and streams it back.

### Core logic files

- [backend/app/services/emotion.py](/Users/lokii/Documents/EmpathyEngine/EmpathyEngine/backend/app/services/emotion.py:1)
  Detects the strongest emotion label and confidence score.
- [backend/app/services/text_enhancer.py](/Users/lokii/Documents/EmpathyEngine/EmpathyEngine/backend/app/services/text_enhancer.py:1)
  Adds emotional punctuation and pauses before speech generation.
- [backend/app/services/mapper.py](/Users/lokii/Documents/EmpathyEngine/EmpathyEngine/backend/app/services/mapper.py:1)
  Converts emotion plus confidence into speaking rate and volume.
- [backend/app/services/tts.py](/Users/lokii/Documents/EmpathyEngine/EmpathyEngine/backend/app/services/tts.py:1)
  Generates the raw speech file with `pyttsx3`.
- [backend/app/routes/tts_routes.py](/Users/lokii/Documents/EmpathyEngine/EmpathyEngine/backend/app/routes/tts_routes.py:1)
  Orchestrates the whole backend flow and serves playable audio.
- [empathy-frontend/src/App.tsx](/Users/lokii/Documents/EmpathyEngine/EmpathyEngine/empathy-frontend/src/App.tsx:1)
  Handles text input, calls the backend, and plays the returned audio.

## Tech Stack

### Backend

- FastAPI
- Uvicorn
- Transformers pipeline
- Hugging Face model: `j-hartmann/emotion-english-distilroberta-base`
- `pyttsx3` for local speech generation

### Frontend

- React
- TypeScript
- Vite
- Axios

## Requirements

### Backend

- Python 3.11 recommended
- macOS is the current best-fit environment for this setup because playback conversion uses the built-in `afconvert` tool

### Frontend

- Node.js 18+ recommended
- npm

## Environment Variables

The backend reads environment variables from `backend/.env`.

Required variable:

```env
HF_TOKEN=your_huggingface_token_here
```

Notes:

- `HF_TOKEN` is used when loading the Hugging Face emotion model.
- `backend/.env.example` exists as the template location for environment setup.

## Backend Setup

From the project root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create the env file:

```bash
cp .env.example .env
```

Then edit `.env` and add your Hugging Face token.

## Frontend Setup

From the project root:

```bash
cd empathy-frontend
npm install
```

## Run the Project

Open two terminals.

### Terminal 1: start the backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

Backend runs at:

```text
http://localhost:8000
```

### Terminal 2: start the frontend

```bash
cd empathy-frontend
npm run dev
```

Frontend usually runs at:

```text
http://localhost:5173
```

## Build Commands

### Frontend production build

```bash
cd empathy-frontend
npm run build
```

### Frontend preview build

```bash
cd empathy-frontend
npm run preview
```

## API Endpoints

### `POST /speak`

Generates emotion-aware speech metadata and writes the audio file.

Query parameter:

- `text`: input message to speak

Example:

```bash
curl -X POST "http://localhost:8000/speak?text=I%20am%20so%20happy%20to%20see%20you"
```

Example response:

```json
{
  "input_text": "Wow! I am so happy to see you!",
  "emotion": "joy",
  "confidence": 0.981,
  "rate": 238,
  "volume": 1.27,
  "audio_file": "example-file.wav"
}
```

### `GET /get-audio`

Returns a browser-playable version of the generated file.

Query parameters:

- `filename`: the file returned by `/speak`
- `format`: `wav` or `mp3`

Recommended:

```text
format=wav
```

Example:

```bash
curl "http://localhost:8000/get-audio?filename=example-file.wav&format=wav" --output playback.wav
```

## Frontend Behavior

The frontend currently:

- sends user text to `http://localhost:8000/speak`
- reads the returned `audio_file`
- requests playback audio from `http://localhost:8000/get-audio`
- converts the response blob into a browser object URL
- plays that audio inside an HTML `<audio>` element

Important note:

- [empathy-frontend/src/App.tsx](/Users/lokii/Documents/EmpathyEngine/EmpathyEngine/empathy-frontend/src/App.tsx:1) currently hardcodes `http://localhost:8000` as the backend URL

## Current Core Logic Summary

This project is not a generic TTS app. Its main idea is:

- understand the emotion in the text
- reshape the text a little to sound more expressive
- map emotion strength into speech speed and loudness
- generate local speech audio
- return a browser-safe playback file to the frontend

In short: text in, emotion-aware speech out.

## Known Notes

- The backend writes generated files into `backend/static/audio/`.
- Generated audio files are runtime artifacts and should not be committed.
- The playback conversion step is separate from generation because the raw generated audio is not always directly browser-friendly.
- `mp3` playback conversion may depend on the local machine and codec support, while `wav` is the safer playback option in the current codebase.
- The project currently uses permissive CORS in development: `allow_origins=["*"]`.

## Troubleshooting

### Backend does not start

Check:

- virtual environment is activated
- dependencies are installed
- `HF_TOKEN` is present in `backend/.env`

### Emotion model fails to load

Check:

- internet access for first model download
- valid Hugging Face token
- installed `transformers`, `torch`, and related dependencies

### Audio file is generated but browser does not play it

Check:

- backend is running on `http://localhost:8000`
- frontend is requesting `format=wav`
- the requested filename exists inside `backend/static/audio/`

### Frontend cannot reach backend

Check:

- backend is running before frontend requests are made
- the frontend constant `API_BASE_URL` still matches your backend URL

## Suggested Next Improvements

- move the frontend backend URL into an environment variable
- clean and simplify `backend/requirements.txt` to direct dependencies only
- add tests for mapping and route behavior
- add a simple health check endpoint
- improve the UI styling and audio status feedback
