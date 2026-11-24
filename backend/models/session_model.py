"""
Session document model for MongoDB.
Defines the structure stored in the 'sessions' collection.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional


def create_session_document(
    session_id: str,
    topic: str,
    student_level: str = "Beginner",
    user_id: Optional[str] = None
) -> dict:
    """
    Returns a new session document ready to be inserted into MongoDB.
    """
    now = datetime.utcnow().isoformat()
    return {
        "session_id": session_id,          # UUID string — primary lookup key
        "topic": topic,
        "student_level": student_level,
        "user_id": user_id,                # Associated user account if logged in
        "status": "active",                # "active" | "completed"
        "conversation_history": [],        # List of { role, content, timestamp }
        "evaluation": None,                # Filled on /session/end
        "overall_score": None,             # Computed average score (0–100)
        "message_count": 0,
        "created_at": now,
        "updated_at": now,
    }


def build_message_entry(role: str, content: str) -> dict:
    """
    Returns a single conversation message dict for storage.
    role: 'teacher' | 'student'
    """
    return {
        "role": role,
        "content": content.strip(),
        "timestamp": datetime.utcnow().isoformat()
    }


def compute_overall_score(evaluation: dict) -> Optional[int]:
    """
    Derives a 0–100 overall score from the three core evaluation criteria.
    Returns None if data is missing.
    """
    try:
        clarity = int(evaluation.get("clarity_score", 0))
        understanding = int(evaluation.get("understanding_score", 0))
        accuracy = int(evaluation.get("accuracy_score", 0))
        average_out_of_10 = (clarity + understanding + accuracy) / 3
        return round((average_out_of_10 / 10) * 100)
    except Exception:
        return None
