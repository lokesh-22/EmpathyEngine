from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes.tts_routes import router
from app.routes.tts_google import router as google_router

app = FastAPI(title="Empathy Engine")

# 🔥 ADD THIS (CORS FIX)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (for dev)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# serve audio files
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(router)
app.include_router(google_router)
