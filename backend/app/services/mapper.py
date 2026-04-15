import random

BASE_RATE = 170
BASE_VOLUME = 1.0

RATE_DELTA = {
    "joy": 70,
    "sadness": -50,
    "anger": 70,
    "fear": -25,
    "neutral": 0
}

VOLUME_DELTA = {
    "joy": 0.35,
    "sadness": -0.35,
    "anger": 0.4,
    "fear": -0.05,
    "neutral": 0
}

def map_emotion_to_voice(emotion, score):
    intensity = score ** 1.5

    rate = BASE_RATE + int(RATE_DELTA.get(emotion, 0) * intensity)
    volume = BASE_VOLUME + (VOLUME_DELTA.get(emotion, 0) * intensity)

    # 🔥 special boost for joy
    if emotion == "joy":
        rate += 10
        volume += 0.05

    # randomness (human feel)
    rate += random.randint(-5, 5)
    volume += random.uniform(-0.03, 0.03)

    # clamp
    rate = max(120, min(260, rate))
    volume = max(0.5, min(1.5, volume))

    return rate, round(volume, 2)


import random

def apply_variation(rate, volume):
    rate += random.randint(-8, 8)
    volume += random.uniform(-0.05, 0.05)
    return rate, volume