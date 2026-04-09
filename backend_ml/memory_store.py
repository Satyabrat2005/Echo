"""
Memory Store for Echo Video Memory Assistant
SQLite-backed persistent storage for person memories, meetings, and conversations.
"""

import os
import json
import sqlite3
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

DB_DIR = "echo_data"
DB_FILE = os.path.join(DB_DIR, "echo_memory.db")


class MemoryStore:
    """Persistent memory store using SQLite for dementia-patient assistant."""

    def __init__(self, db_path: str = DB_FILE):
        if db_path != ":memory:":
            os.makedirs(os.path.dirname(db_path) or ".", exist_ok=True)
        self.db_path = db_path
        # For :memory: databases, keep a persistent connection
        self._persistent_conn: Optional[sqlite3.Connection] = None
        if db_path == ":memory:":
            self._persistent_conn = sqlite3.connect(":memory:")
            self._persistent_conn.row_factory = sqlite3.Row
        self._init_db()

    # ------------------------------------------------------------------ #
    #  Database initialisation                                            #
    # ------------------------------------------------------------------ #

    def _get_conn(self) -> sqlite3.Connection:
        if self._persistent_conn is not None:
            return self._persistent_conn
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        return conn

    def _close_conn(self, conn: sqlite3.Connection) -> None:
        """Close the connection unless it is the persistent in-memory one."""
        if conn is not self._persistent_conn:
            conn.close()

    def _init_db(self) -> None:
        conn = self._get_conn()
        try:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS persons (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    name        TEXT    NOT NULL UNIQUE,
                    relationship TEXT   DEFAULT 'friend',
                    notes       TEXT   DEFAULT '',
                    created_at  TEXT   NOT NULL,
                    updated_at  TEXT   NOT NULL
                );

                CREATE TABLE IF NOT EXISTS meetings (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    person_id   INTEGER NOT NULL,
                    location    TEXT    DEFAULT '',
                    topics      TEXT    DEFAULT '',
                    photo_path  TEXT    DEFAULT '',
                    meeting_time TEXT   NOT NULL,
                    created_at  TEXT    NOT NULL,
                    FOREIGN KEY (person_id) REFERENCES persons(id)
                );

                CREATE TABLE IF NOT EXISTS conversations (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    person_id   INTEGER NOT NULL,
                    role        TEXT    NOT NULL,   -- 'user' or 'assistant'
                    message     TEXT    NOT NULL,
                    timestamp   TEXT    NOT NULL,
                    FOREIGN KEY (person_id) REFERENCES persons(id)
                );
                """
            )
            conn.commit()
            logger.info("Memory database initialised at %s", self.db_path)
        finally:
            self._close_conn(conn)

    # ------------------------------------------------------------------ #
    #  Person CRUD                                                        #
    # ------------------------------------------------------------------ #

    def add_person(
        self,
        name: str,
        relationship: str = "friend",
        notes: str = "",
    ) -> int:
        """Add a new person. Returns the person id."""
        now = datetime.now().isoformat()
        conn = self._get_conn()
        try:
            cur = conn.execute(
                "INSERT OR IGNORE INTO persons (name, relationship, notes, created_at, updated_at) "
                "VALUES (?, ?, ?, ?, ?)",
                (name.strip().title(), relationship, notes, now, now),
            )
            conn.commit()
            if cur.lastrowid and cur.lastrowid > 0:
                return cur.lastrowid
            # Already exists -> fetch id
            row = conn.execute(
                "SELECT id FROM persons WHERE name = ?",
                (name.strip().title(),),
            ).fetchone()
            return row["id"] if row else -1
        finally:
            self._close_conn(conn)

    def get_person(self, name: str) -> Optional[Dict[str, Any]]:
        """Retrieve a person record by name."""
        conn = self._get_conn()
        try:
            row = conn.execute(
                "SELECT * FROM persons WHERE name = ? COLLATE NOCASE",
                (name.strip(),),
            ).fetchone()
            return dict(row) if row else None
        finally:
            self._close_conn(conn)

    def get_person_by_id(self, person_id: int) -> Optional[Dict[str, Any]]:
        conn = self._get_conn()
        try:
            row = conn.execute(
                "SELECT * FROM persons WHERE id = ?", (person_id,)
            ).fetchone()
            return dict(row) if row else None
        finally:
            self._close_conn(conn)

    def list_persons(self) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        try:
            rows = conn.execute(
                "SELECT * FROM persons ORDER BY updated_at DESC"
            ).fetchall()
            return [dict(r) for r in rows]
        finally:
            self._close_conn(conn)

    def update_person(
        self,
        name: str,
        relationship: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> bool:
        conn = self._get_conn()
        try:
            parts = []
            params: list = []
            if relationship is not None:
                parts.append("relationship = ?")
                params.append(relationship)
            if notes is not None:
                parts.append("notes = ?")
                params.append(notes)
            if not parts:
                return False
            parts.append("updated_at = ?")
            params.append(datetime.now().isoformat())
            params.append(name.strip().title())
            conn.execute(
                f"UPDATE persons SET {', '.join(parts)} WHERE name = ? COLLATE NOCASE",
                params,
            )
            conn.commit()
            return True
        finally:
            self._close_conn(conn)

    def search_persons(self, query: str) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        try:
            rows = conn.execute(
                "SELECT * FROM persons WHERE name LIKE ? COLLATE NOCASE",
                (f"%{query.strip()}%",),
            ).fetchall()
            return [dict(r) for r in rows]
        finally:
            self._close_conn(conn)

    # ------------------------------------------------------------------ #
    #  Meeting log                                                        #
    # ------------------------------------------------------------------ #

    def add_meeting(
        self,
        person_name: str,
        location: str = "",
        topics: str = "",
        photo_path: str = "",
        meeting_time: Optional[str] = None,
    ) -> int:
        """Log a meeting with a person. Creates the person if needed."""
        person = self.get_person(person_name)
        if person is None:
            person_id = self.add_person(person_name)
        else:
            person_id = person["id"]

        now = datetime.now().isoformat()
        mt = meeting_time or now
        conn = self._get_conn()
        try:
            cur = conn.execute(
                "INSERT INTO meetings (person_id, location, topics, photo_path, meeting_time, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (person_id, location, topics, photo_path, mt, now),
            )
            conn.commit()
            # Update person's updated_at
            conn.execute(
                "UPDATE persons SET updated_at = ? WHERE id = ?",
                (now, person_id),
            )
            conn.commit()
            return cur.lastrowid or -1
        finally:
            self._close_conn(conn)

    def get_meetings(
        self, person_name: str, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get recent meetings with a person."""
        person = self.get_person(person_name)
        if person is None:
            return []
        conn = self._get_conn()
        try:
            rows = conn.execute(
                "SELECT * FROM meetings WHERE person_id = ? ORDER BY meeting_time DESC LIMIT ?",
                (person["id"], limit),
            ).fetchall()
            return [dict(r) for r in rows]
        finally:
            self._close_conn(conn)

    def get_latest_meeting(self, person_name: str) -> Optional[Dict[str, Any]]:
        meetings = self.get_meetings(person_name, limit=1)
        return meetings[0] if meetings else None

    # ------------------------------------------------------------------ #
    #  Conversation history                                               #
    # ------------------------------------------------------------------ #

    def add_conversation(
        self, person_name: str, role: str, message: str
    ) -> int:
        person = self.get_person(person_name)
        if person is None:
            person_id = self.add_person(person_name)
        else:
            person_id = person["id"]

        now = datetime.now().isoformat()
        conn = self._get_conn()
        try:
            cur = conn.execute(
                "INSERT INTO conversations (person_id, role, message, timestamp) "
                "VALUES (?, ?, ?, ?)",
                (person_id, role, message, now),
            )
            conn.commit()
            return cur.lastrowid or -1
        finally:
            self._close_conn(conn)

    def get_conversations(
        self, person_name: str, limit: int = 20
    ) -> List[Dict[str, Any]]:
        person = self.get_person(person_name)
        if person is None:
            return []
        conn = self._get_conn()
        try:
            rows = conn.execute(
                "SELECT * FROM conversations WHERE person_id = ? ORDER BY timestamp DESC LIMIT ?",
                (person["id"], limit),
            ).fetchall()
            return [dict(r) for r in reversed(rows)]
        finally:
            self._close_conn(conn)

    # ------------------------------------------------------------------ #
    #  Rich person summary (used by AI assistant)                         #
    # ------------------------------------------------------------------ #

    def get_person_summary(self, person_name: str) -> Optional[Dict[str, Any]]:
        """
        Build a comprehensive summary of a person for the AI to use
        when answering "who is this?" questions.
        """
        person = self.get_person(person_name)
        if person is None:
            return None

        meetings = self.get_meetings(person_name, limit=5)
        conversations = self.get_conversations(person_name, limit=10)

        return {
            "name": person["name"],
            "relationship": person["relationship"],
            "notes": person["notes"],
            "first_met": person["created_at"],
            "last_updated": person["updated_at"],
            "recent_meetings": [
                {
                    "location": m["location"],
                    "topics": m["topics"],
                    "time": m["meeting_time"],
                }
                for m in meetings
            ],
            "recent_conversations": [
                {
                    "role": c["role"],
                    "message": c["message"],
                    "time": c["timestamp"],
                }
                for c in conversations
            ],
        }

    def get_all_summaries(self) -> List[Dict[str, Any]]:
        """Get summaries for all known persons."""
        persons = self.list_persons()
        summaries = []
        for p in persons:
            s = self.get_person_summary(p["name"])
            if s:
                summaries.append(s)
        return summaries


# ---------------------------------------------------------------------------
# Module-level singleton for convenience
# ---------------------------------------------------------------------------
_store: Optional[MemoryStore] = None


def get_memory_store(db_path: str = DB_FILE) -> MemoryStore:
    global _store
    if _store is None:
        _store = MemoryStore(db_path)
    return _store


# ---------------------------------------------------------------------------
# Quick self-test
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    store = MemoryStore(":memory:")

    pid = store.add_person("Ashutosh", relationship="friend", notes="College buddy")
    print(f"Added person id={pid}")

    store.add_meeting("Ashutosh", location="Coffee shop", topics="Discussed project Echo")
    store.add_conversation("Ashutosh", "user", "Hey Ashutosh, long time!")
    store.add_conversation("Ashutosh", "assistant", "Yes, you last met him 3 days ago at the coffee shop.")

    summary = store.get_person_summary("Ashutosh")
    print(json.dumps(summary, indent=2))
