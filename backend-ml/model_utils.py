def detect_emotion(text: str) -> str:
    text = text.lower()

    if any(w in text for w in ["scared", "afraid", "lost", "help"]):
        return "anxious"
    elif any(w in text for w in ["angry", "mad", "upset"]):
        return "frustrated"
    elif any(w in text for w in ["happy", "glad", "okay", "fine"]):
        return "calm"
    elif any(w in text for w in ["tired", "sleepy", "weak"]):
        return "exhausted"
    else:
        return "neutral"
