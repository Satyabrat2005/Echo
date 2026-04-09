"""
Command Recognizer for Echo Video Memory Assistant
Detects user intent from natural language in diverse styles and languages.

Supported intents:
  - TAKE_PHOTO: "take photo", "click the picture", "snap it", "capture this", ...
  - GREET_PERSON: "hi Ashutosh", "hello doctor", "hey Ram", ...
  - WHO_IS_THIS: "who is this", "who is he", "who is she", "kaun hai ye", ...
  - GENERAL_CHAT: anything else -> forwarded to AI chatbot
"""

import re
import logging
from typing import Optional, Tuple
from difflib import SequenceMatcher

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Pattern banks  (each list is checked with fuzzy + regex matching)
# ---------------------------------------------------------------------------

TAKE_PHOTO_PATTERNS = [
    # English
    r"\btake\s*(a\s*)?photo\b",
    r"\btake\s*(a\s*)?picture\b",
    r"\btake\s*(a\s*)?pic\b",
    r"\bclick\s*(a\s*)?(the\s*)?picture\b",
    r"\bclick\s*(a\s*)?(the\s*)?photo\b",
    r"\bcapture\s*(this|that|it|him|her|them)?\b",
    r"\bsnap\s*(a\s*)?(photo|picture|pic|it)?\b",
    r"\bshoot\s*(a\s*)?(photo|picture|pic)?\b",
    r"\bphoto\s*(le|lo|lena|lete)\b",           # Hindi informal
    r"\btasveer\s*(le|lo|khicho|khiinch)\b",     # Hindi / Urdu
    r"\bpic\s*(le|lo)\b",
    r"\bphoto\s*(khicho|khiinch|kheench)\b",
    r"\bselfie\s*(le|lo)?\b",
    r"\bcamera\s*(se|say)?\s*(photo|pic)\b",
    r"\bphotograph\b",
    r"\bsave\s*(this\s*)?(face|photo|image|picture|person)\b",
    r"\brecord\s*(this\s*)?(face|moment|person)\b",
    r"\bremember\s*(this\s*)?(face|person|him|her)\b",
    r"\bstore\s*(this\s*)?(photo|image|picture|face)\b",
]

GREETING_PATTERNS = [
    r"\b(hi|hello|hey|hii|hiii|hola|namaste|namaskar|namasthe|assalam|salam|yo)\s+(\w[\w\s]{0,30})",
    r"\b(hii+)\s+(\w[\w\s]{0,30})",
]

WHO_IS_THIS_PATTERNS = [
    r"\bwho\s*(is|'s)\s*(this|that|he|she|him|her|them|the\s*person)\b",
    r"\bwho\s*are\s*(you|they|these)\b",
    r"\bdo\s*(i|you)\s*know\s*(him|her|this|that)\b",
    r"\brecognize\s*(him|her|this|that|them)\b",
    r"\bidentify\s*(him|her|this|that|the\s*person)\b",
    r"\bye\s*kaun\s*(hai|h|he)\b",               # Hindi: ye kaun hai
    r"\bkaun\s*(hai|h|he)\s*(ye|yeh|wo|woh)?\b",  # Hindi: kaun hai ye
    r"\bpehchaan(o|te)?\b",                        # Hindi: pehchaano
    r"\bwhat\s*is\s*(his|her)\s*name\b",
    r"\btell\s*me\s*(about|who)\s*(him|her|this|that)\b",
    r"\bhave\s*(i|we)\s*(met|seen)\s*(him|her|this|that)\b",
]

WHAT_TO_TALK_PATTERNS = [
    r"\bwhat\s*(should|can|do)\s*(i|we)\s*(talk|speak|discuss|say)\b",
    r"\bwhat\s*(to|should\s*i)\s*(talk|speak|discuss|say)\b",
    r"\bhelp\s*me\s*(talk|speak|converse|chat)\b",
    r"\bconversation\s*(starter|topic|help)\b",
    r"\bkya\s*baat\s*(karu|kare|karein|karun)\b",  # Hindi
]

# Keywords for quick fallback matching
PHOTO_KEYWORDS = [
    "photo", "picture", "pic", "snap", "capture", "click", "shoot",
    "selfie", "photograph", "tasveer", "camera", "save face",
    "remember face", "store face", "record face",
]

WHO_KEYWORDS = [
    "who", "recognize", "identify", "kaun", "pehchaan", "name",
]


class CommandRecognizer:
    """Recognizes user intent from free-form text."""

    def __init__(self, fuzzy_threshold: float = 0.75):
        self.fuzzy_threshold = fuzzy_threshold

    # ------------------------------------------------------------------ #
    #  Public API                                                         #
    # ------------------------------------------------------------------ #

    def recognize(self, text: str) -> Tuple[str, Optional[str]]:
        """
        Classify the user's text into an intent.

        Returns:
            (intent, extracted_value)
            intent is one of:
                "TAKE_PHOTO"   - user wants to take / save a photo
                "GREET_PERSON" - user is greeting someone (extracted_value = name)
                "WHO_IS_THIS"  - user asks who someone is
                "WHAT_TO_TALK" - user asks what to talk about with someone
                "GENERAL_CHAT" - anything else
            extracted_value is the person name (for GREET_PERSON) or None.
        """
        if not text or not text.strip():
            return "GENERAL_CHAT", None

        cleaned = text.strip()

        # 1) Check TAKE_PHOTO (regex patterns first)
        if self._match_patterns(cleaned, TAKE_PHOTO_PATTERNS):
            return "TAKE_PHOTO", None

        # 2) Check WHAT_TO_TALK (before WHO so "what should I talk" isn't caught by fuzzy "who")
        if self._match_patterns(cleaned, WHAT_TO_TALK_PATTERNS):
            return "WHAT_TO_TALK", None

        # 3) Check WHO_IS_THIS
        if self._match_patterns(cleaned, WHO_IS_THIS_PATTERNS):
            return "WHO_IS_THIS", None

        # 4) Check GREET_PERSON (before fuzzy fallbacks)
        name = self._extract_greeting_name(cleaned)
        if name:
            return "GREET_PERSON", name

        # 5) Fuzzy keyword fallbacks (higher threshold to avoid false positives)
        if self._fuzzy_keyword_match(cleaned, PHOTO_KEYWORDS):
            return "TAKE_PHOTO", None
        if self._fuzzy_keyword_match(cleaned, WHO_KEYWORDS):
            return "WHO_IS_THIS", None

        # 6) Fallback
        return "GENERAL_CHAT", None

    # ------------------------------------------------------------------ #
    #  Private helpers                                                    #
    # ------------------------------------------------------------------ #

    @staticmethod
    def _match_patterns(text: str, patterns: list) -> bool:
        lower = text.lower()
        for pattern in patterns:
            if re.search(pattern, lower):
                return True
        return False

    @staticmethod
    def _extract_greeting_name(text: str) -> Optional[str]:
        lower = text.lower().strip()
        for pattern in GREETING_PATTERNS:
            m = re.search(pattern, lower)
            if m:
                # The last captured group is the name portion
                raw_name = m.group(m.lastindex or 2).strip()
                # Clean up: remove trailing punctuation, limit length
                raw_name = re.sub(r"[^\w\s]", "", raw_name).strip()
                if raw_name and len(raw_name) < 40:
                    # Title-case the name
                    return raw_name.title()
        return None

    def _fuzzy_keyword_match(self, text: str, keywords: list) -> bool:
        """Check if any keyword is a fuzzy sub-match inside the text."""
        words = text.lower().split()
        for kw in keywords:
            for word in words:
                ratio = SequenceMatcher(None, kw, word).ratio()
                if ratio >= self.fuzzy_threshold:
                    return True
        return False


# ---------------------------------------------------------------------------
# Convenience singleton
# ---------------------------------------------------------------------------
_default_recognizer = CommandRecognizer()


def recognize_command(text: str) -> Tuple[str, Optional[str]]:
    """Module-level shortcut using the default recognizer."""
    return _default_recognizer.recognize(text)


# ---------------------------------------------------------------------------
# Quick self-test
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    test_inputs = [
        "take photo",
        "Click the picture please",
        "snap it bro",
        "capture this man",
        "photo le lo yaar",
        "hi Ashutosh",
        "hello doctor sahab",
        "hey Ram how are you",
        "hii Sneha",
        "who is this guy",
        "who's he?",
        "ye kaun hai",
        "Do I know him?",
        "what should I talk about",
        "Tell me a joke",
        "kya baat karu isse",
        "remember this face",
        "save this person",
    ]
    recognizer = CommandRecognizer()
    for inp in test_inputs:
        intent, value = recognizer.recognize(inp)
        print(f"  {inp:40s} -> {intent:15s}  value={value}")
