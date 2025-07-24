import csv
import os
from datetime import datetime
import pandas as pd

LOG_FILE = "logs/emotion_logs.csv"

def log_emotion(text: str, emotion: str, confidence: float):
    os.makedirs("logs", exist_ok=True)
    file_exists = os.path.isfile(LOG_FILE)

    with open(LOG_FILE, "a", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        if not file_exists:
            writer.writerow(["timestamp", "input_text", "emotion", "confidence"])
        writer.writerow([datetime.now().isoformat(), text, emotion, round(confidence, 2)])


def get_emotion_summary():
    if not os.path.exists(LOG_FILE):
        return {
            "total": 0,
            "emotions": {},
            "most_recent": None,
            "average_confidence": None
        }

    df = pd.read_csv(LOG_FILE)

    emotion_counts = df["emotion"].value_counts().to_dict()
    most_recent = df.iloc[-1]["emotion"]
    avg_confidence = round(df["confidence"].mean(), 2)

    return {
        "total": len(df),
        "emotions": emotion_counts,
        "most_recent": most_recent,
        "average_confidence": avg_confidence
    }


def check_emotion_streak(target_emotion="anxious", streak_length=3):
    if not os.path.exists(LOG_FILE):
        return {
            "streak_detected": False,
            "recent_emotions": [],
            "count": 0
        }

    df = pd.read_csv(LOG_FILE)
    recent = df["emotion"].tail(streak_length).tolist()
    count = recent.count(target_emotion)

    return {
        "streak_detected": recent == [target_emotion] * streak_length,
        "recent_emotions": recent,
        "count": count
    }


def check_caregiver_alert(lookback: int = 5, threshold: int = 3):
    if not os.path.exists(LOG_FILE):
        return {
            "should_alert": False,
            "distress_count": 0,
            "distress_emotions": [],
            "recent_emotions": []
        }

    df = pd.read_csv(LOG_FILE)
    recent = df["emotion"].tail(lookback).tolist()
    distress_emotions = ["anxious", "frustrated", "disoriented"]

    distress_count = sum(1 for e in recent if e in distress_emotions)

    return {
        "should_alert": distress_count >= threshold,
        "distress_count": distress_count,
        "distress_emotions": distress_emotions,
        "recent_emotions": recent
    }
