from transformers import pipeline
import os
from app.config import HF_TOKEN

classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    token=os.getenv("HF_TOKEN"),
    top_k=None
)

def detect_emotion(text: str):
    results = classifier(text)[0]
    top = max(results, key=lambda x: x['score'])
    return top['label'], top['score']