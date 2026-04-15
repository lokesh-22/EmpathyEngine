BASE_RATE = 170
BASE_VOLUME = 1.0

RATE_DELTA = {
    "joy": 40,
    "sadness": -40,
    "anger": 50,
    "fear": -20,
    "neutral": 0
}

VOLUME_DELTA = {
    "joy": 0.2,
    "sadness": -0.3,
    "anger": 0.3,
    "fear": 0,
    "neutral": 0
}

def map_emotion_to_voice(emotion, score):
    rate = BASE_RATE + int(RATE_DELTA.get(emotion, 0) * score)
    volume = BASE_VOLUME + (VOLUME_DELTA.get(emotion, 0) * score)

    return rate, volume