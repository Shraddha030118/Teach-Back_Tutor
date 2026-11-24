from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


# -------------------------------------------------------------
# Start Session Schemas: POST /session/start
# -------------------------------------------------------------
class StartSessionRequest(BaseModel):
    topic: str = Field(..., description="The topic the student wants to teach")
    student_level: Optional[str] = Field(default="Beginner", description="Student's self-assessed level")
    user_id: Optional[str] = Field(default=None, description="Optional ID of authenticated user")

    @field_validator("topic")
    @classmethod
    def validate_topic(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("topic cannot be empty.")
        return v.strip()


class StartSessionResponse(BaseModel):
    session_id: str = Field(..., description="Unique session identifier — store this in React state")
    topic: str
    status: str = Field(default="active")
    created_at: str
    persisted: bool = Field(
        default=False,
        description="True if saved to MongoDB; False if running in in-memory fallback mode"
    )


# -------------------------------------------------------------
# Chat Message Schemas: POST /session/message
# -------------------------------------------------------------
class SessionMessageRequest(BaseModel):
    topic: str = Field(..., description="Topic being taught")
    student_message: str = Field(..., description="Teacher's explanation sent to the AI student")
    conversation_history: Optional[List[Dict[str, Any]]] = Field(
        default_factory=list,
        description="Previous messages as [{ role, content }]"
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Session ID returned by /session/start (optional — enables MongoDB persistence)"
    )
    user_id: Optional[str] = Field(
        default=None,
        description="Optional ID of authenticated user"
    )

    @field_validator("student_message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("student_message cannot be empty.")
        return v.strip()

    @field_validator("topic")
    @classmethod
    def validate_topic(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("topic cannot be empty.")
        return v.strip()


class SessionMessageResponse(BaseModel):
    ai_response: str = Field(..., description="AI student's curious question(s)")
    topic: str
    session_id: Optional[str] = None
    status: str = Field(default="success")


# -------------------------------------------------------------
# Evaluation Schemas: POST /session/end
# -------------------------------------------------------------
class EvaluationReport(BaseModel):
    clarity_score: int = Field(..., ge=0, le=10, description="Clarity score 0–10")
    understanding_score: int = Field(..., ge=0, le=10, description="Understanding score 0–10")
    accuracy_score: int = Field(..., ge=0, le=10, description="Accuracy score 0–10")
    strengths: List[str] = Field(default_factory=list)
    knowledge_gaps: List[str] = Field(default_factory=list)
    misconceptions: List[str] = Field(default_factory=list)
    revision_topics: List[str] = Field(default_factory=list)
    overall_feedback: str = Field(..., description="Pedagogical feedback paragraph")


class EndSessionRequest(BaseModel):
    topic: str = Field(..., description="Topic being taught")
    conversation_history: List[Dict[str, Any]] = Field(
        ..., description="Complete conversation transcript"
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Session ID to update in MongoDB"
    )

    @field_validator("topic")
    @classmethod
    def validate_topic(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("topic cannot be empty.")
        return v.strip()


class EndSessionResponse(BaseModel):
    evaluation: EvaluationReport
    topic: str
    session_id: Optional[str] = None
    overall_score: Optional[int] = None
    status: str = Field(default="success")


# -------------------------------------------------------------
# Session History Schemas: GET /sessions, GET /sessions/{id}
# -------------------------------------------------------------
class SessionListItem(BaseModel):
    id: str                           # session_id
    topic: str
    student_level: str = "Beginner"
    status: str
    created_at: str
    message_count: int = 0
    overall_score: Optional[int] = None
    user_id: Optional[str] = None


class SessionDetailResponse(BaseModel):
    id: str
    topic: str
    student_level: str = "Beginner"
    status: str
    conversation_history: List[Dict[str, Any]] = []
    evaluation: Optional[Dict[str, Any]] = None
    overall_score: Optional[int] = None
    user_id: Optional[str] = None
    created_at: str
    updated_at: str


# -------------------------------------------------------------
# Legacy / helper schemas (kept for backward compatibility)
# -------------------------------------------------------------
class MessageSchema(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None


class CreateSessionRequest(BaseModel):
    topic: str
    student_level: Optional[str] = "Beginner"


class SessionResponse(BaseModel):
    id: str
    topic: str
    student_level: str
    status: str
    created_at: str
    updated_at: str
    messages: List[Dict[str, Any]] = []
    evaluation: Optional[Dict[str, Any]] = None
