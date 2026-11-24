"""
MongoDB connection manager for Teach-Back Tutor.
Uses Motor (async MongoDB driver) with graceful fallback to in-memory mode
when MongoDB is not configured or unreachable.
"""

import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "").strip()
DB_NAME = os.getenv("DB_NAME", "teach_back_tutor")

# Global references
_client = None
_db = None
_mongo_available = False


async def connect_to_mongo():
    """
    Connect to MongoDB at application startup.
    Falls back gracefully if Motor is not installed or MongoDB is unreachable.
    """
    global _client, _db, _mongo_available

    if not MONGODB_URL:
        print("[Database] MONGODB_URL not set — running in in-memory mode.")
        _mongo_available = False
        return

    try:
        from motor.motor_asyncio import AsyncIOMotorClient

        _client = AsyncIOMotorClient(
            MONGODB_URL,
            serverSelectionTimeoutMS=5000,   # 5s timeout for initial connection
            connectTimeoutMS=5000,
            socketTimeoutMS=10000,
        )

        # Ping to verify the connection is actually alive
        await _client.admin.command("ping")

        _db = _client[DB_NAME]
        _mongo_available = True

        # Create indexes for fast lookups
        await _db.sessions.create_index("session_id", unique=True)
        await _db.sessions.create_index("status")
        await _db.sessions.create_index("created_at")
        await _db.sessions.create_index("user_id")

        await _db.users.create_index("email", unique=True)
        await _db.users.create_index("user_id", unique=True)

        print(f"[Database] ✅ Connected to MongoDB — database: '{DB_NAME}'")

    except ImportError:
        print("[Database] ⚠️  'motor' package not installed — running in in-memory mode.")
        print("[Database]    Install with: pip install motor")
        _mongo_available = False

    except Exception as exc:
        print(f"[Database] ⚠️  Could not connect to MongoDB: {exc}")
        print("[Database]    Running in in-memory mode. Add MONGODB_URL to .env to enable persistence.")
        _mongo_available = False


async def close_mongo_connection():
    """Close the MongoDB connection at application shutdown."""
    global _client, _mongo_available
    if _client:
        _client.close()
        print("[Database] MongoDB connection closed.")
    _mongo_available = False


def get_database():
    """Return the database instance, or None if not connected."""
    return _db


def get_sessions_collection():
    """Return the sessions collection, or None if not connected."""
    if _db is None:
        return None
    return _db.sessions


def get_users_collection():
    """Return the users collection, or None if not connected."""
    if _db is None:
        return None
    return _db.users


def is_mongo_available() -> bool:
    """Check whether MongoDB is connected and available."""
    return _mongo_available
