from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from model_utils import detect_emotion  # type: ignore
from speech_utils import audio_to_text  # type: ignore
from fastapi.middleware.cors import CORSMiddleware
from logger_utils import log_emotion  # type: ignore
from logger_utils import get_emotion_summary  # type: ignore

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmotionRequest(BaseModel):
    text: str

# Endpoint: Text input
@app.post("/detect-emotion")
async def detect_emotion_api(req: EmotionRequest):
    emotion, confidence = detect_emotion(req.text)

    log_emotion(req.text, emotion, confidence)

    response_map = {
        "anxious": "You sound anxious. It’s okay, you’re safe and not alone.",
        "frustrated": "You seem frustrated. Take your time, I’m here to help.",
        "calm": "That’s good to hear. Let me know if you need anything.",
        "exhausted": "You might need rest. You’re doing okay.",
        "disoriented": "It looks like you're unsure where you are. Let me remind you, you're at home and you're safe.",
        "neutral": "I’m with you. Everything is okay."
    }

    return {
        "emotion": emotion,
        "confidence": confidence,
        "response": response_map.get(emotion, "I'm here with you.")
    }

# Endpoint: Audio file input
@app.post("/detect-emotion-from-audio")
async def detect_emotion_from_audio(file: UploadFile = File(...)):
    file_path = "temp_audio.wav"

    # Save uploaded file
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Convert audio to text
    text = audio_to_text(file_path)

    # Detect emotion
    emotion, confidence = detect_emotion(text)

    log_emotion(text, emotion, confidence)

    return {
        "original_text": text,
        "emotion": emotion,
        "confidence": confidence
    }

@app.get("/emotion-stats")
async def emotion_stats():
    return get_emotion_summary()
