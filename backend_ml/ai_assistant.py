"""
AI Assistant for Echo Video Memory Assistant
Integrates with DeepSeek R1 model for memory recall and chatbot functionality.

Features:
  - "Who is this?" -> detailed person recall from memory store
  - "What should I talk about?" -> conversation suggestions
  - General chatbot for dementia patients (empathetic, simple, reassuring)
"""

import os
import json
import logging
import requests
from typing import Optional, List, Dict, Any
from datetime import datetime

from memory_store import get_memory_store, MemoryStore

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
#  Configuration
# ---------------------------------------------------------------------------

DEEPSEEK_API_URL = os.getenv(
    "DEEPSEEK_API_URL", "https://api.deepseek.com/v1/chat/completions"
)
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-reasoner")

SYSTEM_PROMPT = (
    "You are Echo, a kind and empathetic AI memory assistant designed to help "
    "people with dementia. You speak in a warm, simple, reassuring tone. "
    "When providing information about people the user has met, be specific "
    "with names, dates, locations, and conversation topics. "
    "Always be patient and encouraging. Keep your answers clear and concise. "
    "If you don't have enough information, say so gently and offer to help "
    "the user remember."
)


class AIAssistant:
    """AI-powered assistant using DeepSeek R1 for memory recall and chat."""

    def __init__(
        self,
        memory: Optional[MemoryStore] = None,
        api_key: str = DEEPSEEK_API_KEY,
        api_url: str = DEEPSEEK_API_URL,
        model: str = DEEPSEEK_MODEL,
    ):
        self.memory = memory or get_memory_store()
        self.api_key = api_key
        self.api_url = api_url
        self.model = model
        # Conversation history for the current session (general chat)
        self.chat_history: List[Dict[str, str]] = []

    # ------------------------------------------------------------------ #
    #  Core LLM call                                                      #
    # ------------------------------------------------------------------ #

    def _call_deepseek(
        self, messages: List[Dict[str, str]], temperature: float = 0.7
    ) -> str:
        """Send messages to DeepSeek R1 and return the assistant reply."""
        if not self.api_key:
            return self._offline_fallback(messages)

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": 1024,
        }

        try:
            resp = requests.post(
                self.api_url, headers=headers, json=payload, timeout=30
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()
        except requests.exceptions.RequestException as exc:
            logger.error("DeepSeek API call failed: %s", exc)
            return self._offline_fallback(messages)
        except (KeyError, IndexError) as exc:
            logger.error("Unexpected API response format: %s", exc)
            return self._offline_fallback(messages)

    def _offline_fallback(self, messages: List[Dict[str, str]]) -> str:
        """Provide a helpful response when the API is unavailable."""
        last_user_msg = ""
        for m in reversed(messages):
            if m["role"] == "user":
                last_user_msg = m["content"]
                break

        # Check if it's a person recall question
        if "PERSON_CONTEXT" in last_user_msg:
            return (
                "I have some information about this person in my memory. "
                "However, the AI service is currently unavailable for a detailed "
                "response. Here is what I know from my records."
            )

        return (
            "I'm here with you. The AI service is temporarily unavailable, "
            "but I can still help you with basic tasks. "
            "Try asking me to take a photo, or tell me someone's name!"
        )

    # ------------------------------------------------------------------ #
    #  Person recall: "Who is this?"                                      #
    # ------------------------------------------------------------------ #

    def recall_person(self, person_name: str) -> str:
        """
        Generate a detailed, empathetic description of a person
        from the memory store, powered by DeepSeek R1.
        """
        summary = self.memory.get_person_summary(person_name)
        if summary is None:
            return (
                f"I don't have any records of someone named {person_name} yet. "
                "Would you like me to remember them for you?"
            )

        context = self._format_person_context(summary)

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"The user is asking about a person. Here is everything I know:\n\n"
                    f"PERSON_CONTEXT:\n{context}\n\n"
                    f"Please tell the user about {person_name} in a warm, detailed way. "
                    f"Mention their relationship, when and where they met, "
                    f"and what they talked about. Be specific with dates and topics."
                ),
            },
        ]

        return self._call_deepseek(messages, temperature=0.6)

    def _format_person_context(self, summary: Dict[str, Any]) -> str:
        """Format a person summary dict into readable context for the LLM."""
        lines = [
            f"Name: {summary['name']}",
            f"Relationship: {summary['relationship']}",
            f"Notes: {summary['notes']}",
            f"First recorded: {summary['first_met']}",
            f"Last updated: {summary['last_updated']}",
        ]

        if summary["recent_meetings"]:
            lines.append("\nRecent meetings:")
            for m in summary["recent_meetings"]:
                lines.append(
                    f"  - {m['time']}: Location: {m['location'] or 'unknown'}, "
                    f"Topics: {m['topics'] or 'not recorded'}"
                )

        if summary["recent_conversations"]:
            lines.append("\nRecent conversations:")
            for c in summary["recent_conversations"]:
                lines.append(f"  [{c['role']}] {c['message']}")

        return "\n".join(lines)

    # ------------------------------------------------------------------ #
    #  Conversation suggestions: "What should I talk about?"              #
    # ------------------------------------------------------------------ #

    def suggest_conversation_topics(self, person_name: str) -> str:
        """Suggest what the user could talk about with a given person."""
        summary = self.memory.get_person_summary(person_name)
        if summary is None:
            return (
                f"I don't know much about {person_name} yet. "
                "You could start by asking them how they are!"
            )

        context = self._format_person_context(summary)

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"The user wants to know what to talk about with {person_name}.\n\n"
                    f"PERSON_CONTEXT:\n{context}\n\n"
                    f"Suggest 3-4 friendly conversation topics based on their history. "
                    f"Keep it simple, warm, and helpful for someone with memory difficulties."
                ),
            },
        ]

        return self._call_deepseek(messages, temperature=0.8)

    # ------------------------------------------------------------------ #
    #  General chatbot                                                    #
    # ------------------------------------------------------------------ #

    def chat(self, user_message: str) -> str:
        """
        General chatbot conversation. Maintains session history
        so the AI has context of the ongoing conversation.
        """
        self.chat_history.append({"role": "user", "content": user_message})

        # Keep history manageable (last 20 exchanges)
        trimmed = self.chat_history[-40:]

        messages = [{"role": "system", "content": SYSTEM_PROMPT}] + trimmed

        reply = self._call_deepseek(messages, temperature=0.7)

        self.chat_history.append({"role": "assistant", "content": reply})

        return reply

    def clear_chat_history(self) -> None:
        self.chat_history.clear()

    # ------------------------------------------------------------------ #
    #  Greeting handler (logs meeting automatically)                      #
    # ------------------------------------------------------------------ #

    def handle_greeting(
        self,
        person_name: str,
        photo_path: str = "",
        location: str = "",
    ) -> str:
        """
        Called when the user greets someone (e.g. "Hi Ashutosh").
        Logs the meeting and returns a helpful response.
        """
        # Ensure the person exists
        person = self.memory.get_person(person_name)
        if person is None:
            self.memory.add_person(person_name)

        # Log the meeting
        self.memory.add_meeting(
            person_name,
            location=location,
            topics="Greeting / casual meeting",
            photo_path=photo_path,
        )

        # Build response
        summary = self.memory.get_person_summary(person_name)
        if summary and summary["recent_meetings"] and len(summary["recent_meetings"]) > 1:
            prev = summary["recent_meetings"][1]  # second most recent (first is current)
            return (
                f"You just met {person_name}! I've saved this meeting. "
                f"Last time you met them was on {prev['time']} "
                f"at {prev['location'] or 'an unknown location'}."
            )

        return (
            f"Nice to meet {person_name}! I've saved this as your first meeting. "
            f"I'll remember them for you."
        )

    # ------------------------------------------------------------------ #
    #  Person recall without AI (offline detailed summary)                #
    # ------------------------------------------------------------------ #

    def recall_person_offline(self, person_name: str) -> str:
        """
        Generate a detailed description from memory without calling the LLM.
        Used as fallback or when API key is not configured.
        """
        summary = self.memory.get_person_summary(person_name)
        if summary is None:
            return f"I don't have any records of {person_name}."

        lines = [f"Here's what I know about {summary['name']}:"]
        lines.append(f"  Relationship: {summary['relationship']}")

        if summary["notes"]:
            lines.append(f"  Notes: {summary['notes']}")

        if summary["recent_meetings"]:
            lines.append("\n  Recent meetings:")
            for m in summary["recent_meetings"]:
                loc = m["location"] or "unknown location"
                topics = m["topics"] or "general conversation"
                lines.append(f"    - On {m['time']}, at {loc}. You discussed: {topics}")

        if summary["recent_conversations"]:
            lines.append("\n  Recent conversations:")
            for c in summary["recent_conversations"]:
                lines.append(f"    [{c['role']}]: {c['message']}")

        return "\n".join(lines)


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------
_assistant: Optional[AIAssistant] = None


def get_ai_assistant() -> AIAssistant:
    global _assistant
    if _assistant is None:
        _assistant = AIAssistant()
    return _assistant


# ---------------------------------------------------------------------------
# Quick self-test
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    from memory_store import MemoryStore

    store = MemoryStore(":memory:")
    assistant = AIAssistant(memory=store, api_key="")

    # Simulate greeting
    print(assistant.handle_greeting("Ashutosh", location="Coffee shop"))
    store.add_conversation("Ashutosh", "user", "How's the project going?")
    store.add_conversation("Ashutosh", "assistant", "Great, we're making progress!")
    store.update_person("Ashutosh", relationship="college friend", notes="Works at TechCorp")

    # Simulate recall
    print("\n--- Person Recall (offline) ---")
    print(assistant.recall_person_offline("Ashutosh"))

    # Simulate conversation suggestion
    print("\n--- Conversation Topics ---")
    print(assistant.suggest_conversation_topics("Ashutosh"))
