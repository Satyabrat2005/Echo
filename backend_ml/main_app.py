"""
Echo - AI-Powered Video Memory Assistant for Dementia Patients
Main Tkinter application integrating camera, command recognition,
memory store, and AI assistant (DeepSeek R1).

Usage:
    python main_app.py
"""

import os
import sys
import threading
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
from datetime import datetime
from typing import Optional
import logging
import cv2
from PIL import Image, ImageTk

from camera_module import CameraManager
from command_recognizer import CommandRecognizer
from memory_store import get_memory_store, MemoryStore
from ai_assistant import AIAssistant

# Try to import speech utils (optional - may not work on all platforms)
try:
    from speech_utils import audio_to_text, speak
    SPEECH_AVAILABLE = True
except ImportError:
    SPEECH_AVAILABLE = False

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class EchoApp:
    """Main Tkinter GUI application for Echo memory assistant."""

    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Echo - Video Memory Assistant")
        self.root.geometry("1200x750")
        self.root.configure(bg="#1a1a2e")
        self.root.minsize(1000, 650)

        # Core modules
        self.camera = CameraManager()
        self.recognizer = CommandRecognizer()
        self.memory = get_memory_store()
        self.assistant = AIAssistant(memory=self.memory)

        # State
        self._camera_running = False
        self._current_frame = None
        self._current_person: Optional[str] = None
        self._video_update_id: Optional[str] = None

        # Build UI
        self._build_styles()
        self._build_ui()

        # Cleanup on close
        self.root.protocol("WM_DELETE_WINDOW", self._on_close)

    # ------------------------------------------------------------------ #
    #  Styles                                                             #
    # ------------------------------------------------------------------ #

    def _build_styles(self) -> None:
        self.colors = {
            "bg": "#1a1a2e",
            "panel": "#16213e",
            "accent": "#0f3460",
            "highlight": "#e94560",
            "text": "#eaeaea",
            "text_dim": "#a0a0b0",
            "input_bg": "#0f3460",
            "success": "#2ecc71",
            "warning": "#f39c12",
        }

        style = ttk.Style()
        style.theme_use("clam")
        style.configure("TFrame", background=self.colors["bg"])
        style.configure(
            "Panel.TFrame", background=self.colors["panel"], relief="flat"
        )
        style.configure(
            "TLabel",
            background=self.colors["bg"],
            foreground=self.colors["text"],
            font=("Segoe UI", 11),
        )
        style.configure(
            "Title.TLabel",
            background=self.colors["bg"],
            foreground=self.colors["highlight"],
            font=("Segoe UI", 16, "bold"),
        )
        style.configure(
            "Status.TLabel",
            background=self.colors["panel"],
            foreground=self.colors["text_dim"],
            font=("Segoe UI", 9),
        )
        style.configure(
            "Accent.TButton",
            background=self.colors["highlight"],
            foreground="white",
            font=("Segoe UI", 10, "bold"),
            padding=8,
        )
        style.map(
            "Accent.TButton",
            background=[("active", "#c0392b")],
        )

    # ------------------------------------------------------------------ #
    #  UI layout                                                          #
    # ------------------------------------------------------------------ #

    def _build_ui(self) -> None:
        # Title bar
        title_frame = ttk.Frame(self.root)
        title_frame.pack(fill=tk.X, padx=10, pady=(10, 5))
        ttk.Label(
            title_frame, text="ECHO", style="Title.TLabel"
        ).pack(side=tk.LEFT)
        ttk.Label(
            title_frame,
            text="AI-Powered Video Memory Assistant",
            style="TLabel",
        ).pack(side=tk.LEFT, padx=15)

        # Main content: left (camera + controls) | right (chat)
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        # ---------- Left panel ----------
        left_panel = ttk.Frame(main_frame, style="Panel.TFrame", width=560)
        left_panel.pack(side=tk.LEFT, fill=tk.BOTH, padx=(0, 5))
        left_panel.pack_propagate(False)

        # Camera feed
        self.camera_label = tk.Label(
            left_panel, bg="#000", width=540, height=400
        )
        self.camera_label.pack(padx=10, pady=10)
        self._show_placeholder()

        # Camera controls
        ctrl_frame = ttk.Frame(left_panel, style="Panel.TFrame")
        ctrl_frame.pack(fill=tk.X, padx=10)

        self.btn_toggle_camera = ttk.Button(
            ctrl_frame,
            text="Start Camera",
            style="Accent.TButton",
            command=self._toggle_camera,
        )
        self.btn_toggle_camera.pack(side=tk.LEFT, padx=5)

        self.btn_capture = ttk.Button(
            ctrl_frame,
            text="Capture Photo",
            style="Accent.TButton",
            command=self._capture_photo_manual,
        )
        self.btn_capture.pack(side=tk.LEFT, padx=5)

        # Person info panel
        info_frame = ttk.Frame(left_panel, style="Panel.TFrame")
        info_frame.pack(fill=tk.X, padx=10, pady=10)

        ttk.Label(
            info_frame,
            text="Current Person:",
            style="Status.TLabel",
        ).pack(side=tk.LEFT, padx=5)
        self.person_label = ttk.Label(
            info_frame, text="None", style="Status.TLabel"
        )
        self.person_label.pack(side=tk.LEFT, padx=5)

        # Status bar
        self.status_label = ttk.Label(
            left_panel, text="Ready", style="Status.TLabel"
        )
        self.status_label.pack(fill=tk.X, padx=10, pady=(0, 5))

        # ---------- Right panel (chat) ----------
        right_panel = ttk.Frame(main_frame, style="Panel.TFrame")
        right_panel.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=(5, 0))

        ttk.Label(
            right_panel,
            text="Memory Chat",
            font=("Segoe UI", 13, "bold"),
            background=self.colors["panel"],
            foreground=self.colors["highlight"],
        ).pack(pady=(10, 5))

        # Chat display
        self.chat_display = scrolledtext.ScrolledText(
            right_panel,
            wrap=tk.WORD,
            bg="#0d1117",
            fg=self.colors["text"],
            font=("Consolas", 10),
            insertbackground="white",
            state=tk.DISABLED,
            relief="flat",
            padx=10,
            pady=10,
        )
        self.chat_display.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        # Configure chat tags
        self.chat_display.tag_configure("user", foreground="#58a6ff")
        self.chat_display.tag_configure("assistant", foreground="#2ecc71")
        self.chat_display.tag_configure("system", foreground="#f39c12")
        self.chat_display.tag_configure("error", foreground="#e94560")

        # Input area
        input_frame = ttk.Frame(right_panel, style="Panel.TFrame")
        input_frame.pack(fill=tk.X, padx=10, pady=(0, 10))

        self.input_entry = tk.Entry(
            input_frame,
            bg=self.colors["input_bg"],
            fg=self.colors["text"],
            font=("Segoe UI", 11),
            insertbackground="white",
            relief="flat",
        )
        self.input_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, ipady=8)
        self.input_entry.bind("<Return>", self._on_enter_pressed)

        ttk.Button(
            input_frame,
            text="Send",
            style="Accent.TButton",
            command=self._on_send_clicked,
        ).pack(side=tk.RIGHT, padx=(5, 0))

        # Welcome message
        self._append_chat(
            "system",
            "Welcome to Echo! I'm your memory assistant.\n"
            "  - Type 'take photo' to capture a photo\n"
            "  - Say 'hi <name>' to greet someone and save their photo\n"
            "  - Ask 'who is this?' to recall a person\n"
            "  - Or just chat with me!\n",
        )

    # ------------------------------------------------------------------ #
    #  Camera control                                                     #
    # ------------------------------------------------------------------ #

    def _show_placeholder(self) -> None:
        self.camera_label.configure(
            text="Camera Off\nClick 'Start Camera' to begin",
            fg="#555",
            font=("Segoe UI", 14),
            compound="center",
        )

    def _toggle_camera(self) -> None:
        if self._camera_running:
            self._stop_camera()
        else:
            self._start_camera()

    def _start_camera(self) -> None:
        if self.camera.open_camera():
            self._camera_running = True
            self.btn_toggle_camera.configure(text="Stop Camera")
            self._set_status("Camera is live")
            self._update_video_feed()
        else:
            self._set_status("Failed to open camera")
            self._append_chat("error", "Could not open camera. Check connections.")

    def _stop_camera(self) -> None:
        self._camera_running = False
        if self._video_update_id is not None:
            self.root.after_cancel(self._video_update_id)
            self._video_update_id = None
        self.camera.close_camera()
        self.btn_toggle_camera.configure(text="Start Camera")
        self._show_placeholder()
        self._set_status("Camera stopped")

    def _update_video_feed(self) -> None:
        """Continuously update the camera feed label."""
        if not self._camera_running:
            return
        ret, frame = self.camera.read_frame()
        if ret and frame is not None:
            self._current_frame = frame.copy()
            # Convert BGR -> RGB -> PIL -> ImageTk
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(rgb)
            img = img.resize((540, 400), Image.LANCZOS)
            imgtk = ImageTk.PhotoImage(image=img)
            self.camera_label.configure(image=imgtk, text="")
            self.camera_label.image = imgtk  # type: ignore[attr-defined]
        self._video_update_id = self.root.after(33, self._update_video_feed)  # ~30 fps

    # ------------------------------------------------------------------ #
    #  Photo capture                                                      #
    # ------------------------------------------------------------------ #

    def _capture_photo_manual(self) -> None:
        """Capture photo from the current frame (button click)."""
        if self._current_frame is None:
            self._append_chat("error", "No camera frame available. Start the camera first.")
            return
        path = self.camera.save_frame(
            self._current_frame, person_name=self._current_person
        )
        if path:
            self._append_chat("system", f"Photo saved: {path}")
            self._set_status(f"Photo captured -> {os.path.basename(path)}")
        else:
            self._append_chat("error", "Failed to save photo.")

    def _capture_for_person(self, person_name: str) -> str:
        """Capture a photo and tag it with the person's name. Returns the path."""
        if self._current_frame is not None:
            path = self.camera.save_frame(
                self._current_frame, person_name=person_name
            )
            return path or ""
        return ""

    # ------------------------------------------------------------------ #
    #  Command processing                                                 #
    # ------------------------------------------------------------------ #

    def _on_enter_pressed(self, _event: tk.Event) -> None:  # type: ignore[type-arg]
        self._process_input()

    def _on_send_clicked(self) -> None:
        self._process_input()

    def _process_input(self) -> None:
        text = self.input_entry.get().strip()
        if not text:
            return
        self.input_entry.delete(0, tk.END)
        self._append_chat("user", text)

        # Run processing in a thread to keep UI responsive
        threading.Thread(target=self._handle_command, args=(text,), daemon=True).start()

    def _handle_command(self, text: str) -> None:
        """Route the user's text to the correct handler (runs in background thread)."""
        intent, value = self.recognizer.recognize(text)
        logger.info("Intent: %s, Value: %s, Text: %s", intent, value, text)

        if intent == "TAKE_PHOTO":
            self._handle_take_photo()

        elif intent == "GREET_PERSON":
            self._handle_greet(value or "Unknown", text)

        elif intent == "WHO_IS_THIS":
            self._handle_who_is_this()

        elif intent == "WHAT_TO_TALK":
            self._handle_what_to_talk()

        elif intent == "GENERAL_CHAT":
            self._handle_general_chat(text)

    def _handle_take_photo(self) -> None:
        if self._current_frame is None:
            self._append_chat("system", "Camera is not active. Start the camera first!")
            return
        path = self.camera.save_frame(
            self._current_frame, person_name=self._current_person
        )
        if path:
            self._append_chat("assistant", f"Photo captured and saved!\nPath: {path}")
            self._set_status("Photo captured")
        else:
            self._append_chat("error", "Failed to capture photo.")

    def _handle_greet(self, person_name: str, raw_text: str) -> None:
        self._current_person = person_name
        self.root.after(0, lambda: self.person_label.configure(text=person_name))

        # Capture photo if camera is on
        photo_path = ""
        if self._current_frame is not None:
            photo_path = self._capture_for_person(person_name)

        # Log the greeting in memory
        response = self.assistant.handle_greeting(
            person_name, photo_path=photo_path
        )
        self._append_chat("assistant", response)
        self._set_status(f"Greeting: {person_name}")

        # Also log the conversation
        self.memory.add_conversation(person_name, "user", raw_text)
        self.memory.add_conversation(person_name, "assistant", response)

    def _handle_who_is_this(self) -> None:
        if self._current_person:
            self._append_chat("system", f"Looking up: {self._current_person}...")
            # Try AI-powered recall first, fall back to offline
            response = self.assistant.recall_person(self._current_person)
            if not response or "unavailable" in response.lower():
                response = self.assistant.recall_person_offline(self._current_person)
            self._append_chat("assistant", response)
        else:
            # List all known persons
            persons = self.memory.list_persons()
            if persons:
                names = ", ".join(p["name"] for p in persons[:10])
                self._append_chat(
                    "assistant",
                    f"I'm not sure who you're looking at right now. "
                    f"People I remember: {names}\n"
                    f"Say 'hi <name>' first so I know who you're with!",
                )
            else:
                self._append_chat(
                    "assistant",
                    "I don't know anyone yet. "
                    "Introduce me by saying 'hi <name>'!",
                )

    def _handle_what_to_talk(self) -> None:
        if self._current_person:
            self._append_chat(
                "system",
                f"Getting conversation topics for {self._current_person}...",
            )
            response = self.assistant.suggest_conversation_topics(
                self._current_person
            )
            self._append_chat("assistant", response)
        else:
            self._append_chat(
                "assistant",
                "Tell me who you're with first! Say 'hi <name>'.",
            )

    def _handle_general_chat(self, text: str) -> None:
        self._set_status("Thinking...")
        response = self.assistant.chat(text)
        self._append_chat("assistant", response)
        self._set_status("Ready")

        # Log conversation if there's a current person
        if self._current_person:
            self.memory.add_conversation(self._current_person, "user", text)
            self.memory.add_conversation(self._current_person, "assistant", response)

    # ------------------------------------------------------------------ #
    #  UI helpers (thread-safe)                                           #
    # ------------------------------------------------------------------ #

    def _append_chat(self, tag: str, message: str) -> None:
        """Append a message to the chat display. Thread-safe via root.after."""
        def _do():
            self.chat_display.configure(state=tk.NORMAL)
            timestamp = datetime.now().strftime("%H:%M:%S")
            prefix_map = {
                "user": f"[{timestamp}] You: ",
                "assistant": f"[{timestamp}] Echo: ",
                "system": f"[{timestamp}] System: ",
                "error": f"[{timestamp}] Error: ",
            }
            prefix = prefix_map.get(tag, f"[{timestamp}] ")
            self.chat_display.insert(tk.END, prefix + message + "\n\n", tag)
            self.chat_display.see(tk.END)
            self.chat_display.configure(state=tk.DISABLED)

        self.root.after(0, _do)

    def _set_status(self, text: str) -> None:
        def _do():
            self.status_label.configure(text=text)
        self.root.after(0, _do)

    # ------------------------------------------------------------------ #
    #  Cleanup                                                            #
    # ------------------------------------------------------------------ #

    def _on_close(self) -> None:
        self._camera_running = False
        if self._video_update_id is not None:
            self.root.after_cancel(self._video_update_id)
        self.camera.close_camera()
        self.root.destroy()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
def main():
    root = tk.Tk()
    app = EchoApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
