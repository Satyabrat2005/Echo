from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import Dict

app = FastAPI()

class EmotionRequest(BaseModel):
    text: str

@app.post("/detect_emotion")
async def detect_emotion(req: EmotionRequest) -> Dict[str, str]:
    # Stub: always returns 'calm' for demo
    return {"emotion": "calm"} 