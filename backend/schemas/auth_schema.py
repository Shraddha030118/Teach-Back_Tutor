"""
Pydantic schemas for Authentication endpoints.
"""

import re
from typing import Optional
from pydantic import BaseModel, Field, field_validator

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=60, description="Full name of the user")
    email: str = Field(..., min_length=5, max_length=120, description="Valid email address")
    password: str = Field(..., min_length=6, max_length=128, description="Password (at least 6 characters)")

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Name cannot be empty.")
        return clean

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if not EMAIL_REGEX.match(clean):
            raise ValueError("Please provide a valid email address.")
        return clean


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=120, description="Registered email address")
    password: str = Field(..., min_length=1, description="Account password")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if not EMAIL_REGEX.match(clean):
            raise ValueError("Please provide a valid email address.")
        return clean


class UserResponse(BaseModel):
    id: str = Field(..., description="Unique user identifier")
    name: str
    email: str
    created_at: str


class AuthResponse(BaseModel):
    token: str = Field(..., description="JWT bearer access token")
    token_type: str = Field(default="bearer")
    user: UserResponse
    status: str = Field(default="success")
    message: Optional[str] = None
