"""
User document model for MongoDB and in-memory store.
Defines the structure stored in the 'users' collection.
"""

from datetime import datetime
from typing import Dict, Any


def create_user_document(
    user_id: str,
    name: str,
    email: str,
    hashed_password: str
) -> dict:
    """
    Returns a new user document ready to be inserted into MongoDB or in-memory store.
    """
    now = datetime.utcnow().isoformat()
    return {
        "user_id": user_id,
        "name": name.strip(),
        "email": email.strip().lower(),
        "hashed_password": hashed_password,
        "created_at": now,
        "updated_at": now
    }


def format_user_response(doc: dict) -> dict:
    """
    Formats a user document for API response, stripping hashed_password.
    """
    return {
        "id": doc.get("user_id", doc.get("id", "")),
        "name": doc.get("name", ""),
        "email": doc.get("email", ""),
        "created_at": doc.get("created_at", "")
    }
