from fastapi import FastAPI
from pydantic import BaseModel
from model_utils import detect_emotion  # type: ignore
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmotionRequest(BaseModel):
    text: str

# API endpoint
@app.post("/detect-emotion")
async def detect_emotion_api(req: EmotionRequest):
    emotion = detect_emotion(req.text)

    response = {
        "anxious": "You sound anxious. It’s okay, you’re safe and not alone.",
        "frustrated": "You seem frustrated. Take your time, I’m here to help.",
        "calm": "That’s good to hear. Let me know if you need anything.",
        "exhausted": "You might need rest. You’re doing okay.",
        "disoriented": "It looks like you're unsure where you are. Let me remind you, you're at home and you're safe.",
        "neutral": "I’m with you. Everything is okay."
    }.get(emotion, "I'm here with you.")

    return {"emotion": emotion, "response": response}
