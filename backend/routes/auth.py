"""
Authentication routes for Teach-Back Tutor API.

Endpoints:
  POST /auth/register  — Register a new user account
  POST /auth/login     — Login with email & password, returns JWT token
  GET  /auth/me        — Get currently authenticated user profile
"""

import uuid
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from schemas.auth_schema import RegisterRequest, LoginRequest, UserResponse, AuthResponse
from models.user_model import create_user_document, format_user_response
from services.auth_service import hash_password, verify_password, create_access_token, decode_access_token
from database.mongodb import get_users_collection, is_mongo_available

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory users store for fallback when MongoDB is unavailable
IN_MEMORY_USERS: Dict[str, dict] = {}

security = HTTPBearer(auto_error=False)


# ---------------------------------------------------------------------------
# Database / Storage helper functions
# ---------------------------------------------------------------------------

async def find_user_by_email(email: str) -> Optional[dict]:
    """Find user document by normalized email."""
    norm_email = email.strip().lower()
    if is_mongo_available():
        col = get_users_collection()
        doc = await col.find_one({"email": norm_email})
        if doc:
            doc.pop("_id", None)
            return doc
        return None
    for u in IN_MEMORY_USERS.values():
        if u.get("email", "").lower() == norm_email:
            return u
    return None


async def find_user_by_id(user_id: str) -> Optional[dict]:
    """Find user document by user_id."""
    if is_mongo_available():
        col = get_users_collection()
        doc = await col.find_one({"user_id": user_id})
        if doc:
            doc.pop("_id", None)
            return doc
        return None
    return IN_MEMORY_USERS.get(user_id)


async def save_user(user_doc: dict):
    """Save user document in MongoDB or in-memory store."""
    if is_mongo_available():
        col = get_users_collection()
        await col.insert_one({**user_doc})
    else:
        IN_MEMORY_USERS[user_doc["user_id"]] = user_doc


# ---------------------------------------------------------------------------
# Auth Dependencies
# ---------------------------------------------------------------------------

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[dict]:
    """
    Extracts and validates JWT Bearer token if provided.
    Returns the user document if valid, or None if unauthenticated / invalid token.
    """
    if not credentials or not credentials.credentials:
        return None

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    user = await find_user_by_id(user_id)
    return user


async def get_required_current_user(
    user: Optional[dict] = Depends(get_current_user)
) -> dict:
    """Dependency for routes requiring authentication."""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in or provide a valid token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


# ---------------------------------------------------------------------------
# Route: POST /auth/register
# ---------------------------------------------------------------------------

@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a New User",
    description="Registers a new user with name, email, and password. Returns a JWT access token."
)
async def register(req: RegisterRequest):
    existing = await find_user_by_email(req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in instead."
        )

    user_id = str(uuid.uuid4())
    hashed_pw = hash_password(req.password)
    user_doc = create_user_document(
        user_id=user_id,
        name=req.name,
        email=req.email,
        hashed_password=hashed_pw
    )

    await save_user(user_doc)

    token = create_access_token({"sub": user_id, "email": user_doc["email"], "name": user_doc["name"]})
    formatted_user = format_user_response(user_doc)

    return AuthResponse(
        token=token,
        token_type="bearer",
        user=UserResponse(**formatted_user),
        status="success",
        message="Registration successful"
    )


# ---------------------------------------------------------------------------
# Route: POST /auth/login
# ---------------------------------------------------------------------------

@router.post(
    "/login",
    response_model=AuthResponse,
    summary="User Login",
    description="Logs in an existing user with email and password. Returns a JWT access token."
)
async def login(req: LoginRequest):
    user = await find_user_by_email(req.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not verify_password(req.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user_id = user.get("user_id", user.get("id", ""))
    token = create_access_token({"sub": user_id, "email": user["email"], "name": user.get("name", "")})
    formatted_user = format_user_response(user)

    return AuthResponse(
        token=token,
        token_type="bearer",
        user=UserResponse(**formatted_user),
        status="success",
        message="Login successful"
    )


# ---------------------------------------------------------------------------
# Route: GET /auth/me
# ---------------------------------------------------------------------------

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Current User Profile",
    description="Returns the profile of the currently authenticated user."
)
async def get_me(current_user: dict = Depends(get_required_current_user)):
    return UserResponse(**format_user_response(current_user))
