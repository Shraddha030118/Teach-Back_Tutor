"""
Session routes for Teach-Back Tutor API.

Endpoints:
  POST /session/start          — Create a new session (saved to MongoDB if available)
  POST /session/message        — Send teacher explanation, get AI student response
  POST /session/end            — Evaluate conversation, save report
  GET  /sessions               — List all completed + active sessions
  GET  /sessions/{session_id}  — Get a specific session with full transcript + report
  POST /session                — Legacy create (kept for backward compatibility)
  GET  /session                — Legacy list (kept for backward compatibility)
  GET  /session/{session_id}   — Legacy get (kept for backward compatibility)
"""

import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, Query, Depends
from routes.auth import get_required_current_user

from schemas.session_schema import (
    StartSessionRequest, StartSessionResponse,
    SessionMessageRequest, SessionMessageResponse,
    EndSessionRequest, EndSessionResponse,
    EvaluationReport,
    SessionListItem, SessionDetailResponse,
    CreateSessionRequest, SessionResponse,
    ProgressAnalyticsResponse, TimelineDataPoint,
    TopicPerformance, PerformanceDistribution,
)
from services.ai_service import generate_student_response
from services.evaluation_service import evaluate_session_transcript
from database.mongodb import get_sessions_collection, is_mongo_available
from models.session_model import create_session_document, build_message_entry, compute_overall_score

# ---------------------------------------------------------------------------
# Router setup
# ---------------------------------------------------------------------------
router = APIRouter(tags=["Session"])

# In-memory fallback store (used when MongoDB is not available)
IN_MEMORY_SESSIONS: Dict[str, Any] = {}


# ---------------------------------------------------------------------------
# Helper: Save/update session in Mongo or in-memory
# ---------------------------------------------------------------------------

async def _get_session_doc(session_id: str) -> Optional[dict]:
    """Fetch a session by session_id from MongoDB or fallback store."""
    if is_mongo_available():
        col = get_sessions_collection()
        doc = await col.find_one({"$or": [{"session_id": session_id}, {"id": session_id}]})
        if doc:
            doc.pop("_id", None)   # Remove bson ObjectId before returning
        return doc
    return IN_MEMORY_SESSIONS.get(session_id)


async def _save_new_session(doc: dict):
    """Insert a new session document."""
    if is_mongo_available():
        col = get_sessions_collection()
        await col.insert_one({**doc})   # Motor modifies doc in-place (adds _id), copy to avoid mutation
    else:
        IN_MEMORY_SESSIONS[doc["session_id"]] = doc


async def _update_session(session_id: str, updates: dict):
    """Apply partial updates to a session document."""
    updates["updated_at"] = datetime.utcnow().isoformat()
    if is_mongo_available():
        col = get_sessions_collection()
        await col.update_one(
            {"$or": [{"session_id": session_id}, {"id": session_id}]},
            {"$set": updates}
        )
    else:
        if session_id in IN_MEMORY_SESSIONS:
            IN_MEMORY_SESSIONS[session_id].update(updates)


async def _append_messages(session_id: str, new_messages: list):
    """Append new message entries to the conversation_history array."""
    if is_mongo_available():
        col = get_sessions_collection()
        await col.update_one(
            {"$or": [{"session_id": session_id}, {"id": session_id}]},
            {
                "$push": {"conversation_history": {"$each": new_messages}},
                "$inc":  {"message_count": len(new_messages)},
                "$set":  {"updated_at": datetime.utcnow().isoformat()}
            }
        )
    else:
        if session_id in IN_MEMORY_SESSIONS:
            IN_MEMORY_SESSIONS[session_id]["conversation_history"].extend(new_messages)
            IN_MEMORY_SESSIONS[session_id]["message_count"] = IN_MEMORY_SESSIONS[session_id].get("message_count", 0) + len(new_messages)
            IN_MEMORY_SESSIONS[session_id]["updated_at"] = datetime.utcnow().isoformat()


async def _list_all_sessions(user_id: Optional[str] = None) -> list:
    """Return all sessions sorted by created_at descending, optionally filtered by user_id."""
    query = {"user_id": user_id} if user_id else {}
    if is_mongo_available():
        col = get_sessions_collection()
        cursor = col.find(query, {"_id": 0}).sort("created_at", -1).limit(100)
        return await cursor.to_list(length=100)
    # In-memory fallback
    sessions = list(IN_MEMORY_SESSIONS.values())
    if user_id:
        sessions = [s for s in sessions if s.get("user_id") == user_id]
    return sorted(
        sessions,
        key=lambda s: s.get("created_at", ""),
        reverse=True
    )


# ---------------------------------------------------------------------------
# POST /session/start  — Create a new session
# ---------------------------------------------------------------------------
@router.post(
    "/session/start",
    response_model=StartSessionResponse,
    summary="Start a New Teaching Session",
    description="Creates a new session document in MongoDB (or in-memory). Returns a session_id to use in subsequent requests."
)
async def start_session(
    request: StartSessionRequest,
    current_user: dict = Depends(get_required_current_user)
):
    session_id = str(uuid.uuid4())
    uid = current_user.get("user_id", current_user.get("id"))
    doc = create_session_document(
        session_id=session_id,
        topic=request.topic,
        student_level=request.student_level or "Beginner",
        user_id=uid
    )
    await _save_new_session(doc)

    return StartSessionResponse(
        session_id=session_id,
        topic=request.topic,
        status="active",
        created_at=doc["created_at"],
        persisted=is_mongo_available()
    )


# ---------------------------------------------------------------------------
# POST /session/message  — AI student responds to teacher's explanation
# ---------------------------------------------------------------------------
@router.post(
    "/session/message",
    response_model=SessionMessageResponse,
    summary="Send Teacher Explanation to AI Student",
    description="Sends the teacher's message to Gemini and returns 1-2 curious questions. Saves to MongoDB if session_id is provided."
)
async def send_session_message(
    request: SessionMessageRequest,
    current_user: dict = Depends(get_required_current_user)
):
    uid = current_user.get("user_id", current_user.get("id"))
    # 1. Generate AI response from Gemini
    ai_response = generate_student_response(
        topic=request.topic,
        student_message=request.student_message,
        conversation_history=request.conversation_history
    )

    # 2. Determine or assign session_id
    active_session_id = request.session_id or str(uuid.uuid4())

    # 3. Ensure session document exists
    doc = await _get_session_doc(active_session_id)
    if not doc:
        new_doc = create_session_document(
            session_id=active_session_id,
            topic=request.topic,
            user_id=uid
        )
        await _save_new_session(new_doc)
    elif uid and not doc.get("user_id"):
        await _update_session(active_session_id, {"user_id": uid})

    # 4. Append both messages to conversation_history
    teacher_msg = build_message_entry("teacher", request.student_message)
    student_msg = build_message_entry("student", ai_response)
    await _append_messages(active_session_id, [teacher_msg, student_msg])

    return SessionMessageResponse(
        ai_response=ai_response,
        topic=request.topic,
        session_id=active_session_id,
        status="success"
    )


# ---------------------------------------------------------------------------
# POST /session/end  — Evaluate and close session
# ---------------------------------------------------------------------------
@router.post(
    "/session/end",
    response_model=EndSessionResponse,
    summary="End Session & Generate Evaluation Report",
    description="Evaluates the full transcript using Gemini AI. Saves the report and marks session as completed."
)
async def end_session(
    request: EndSessionRequest,
    current_user: dict = Depends(get_required_current_user)
):
    uid = current_user.get("user_id", current_user.get("id"))
    # 1. Run Gemini evaluation
    evaluation_data = evaluate_session_transcript(
        topic=request.topic,
        conversation_history=request.conversation_history
    )

    # 2. Compute overall percentage score
    overall_score = compute_overall_score(evaluation_data)

    # 3. Persist evaluation + mark completed
    active_session_id = request.session_id
    if active_session_id:
        doc = await _get_session_doc(active_session_id)
        if not doc:
            new_doc = create_session_document(
                session_id=active_session_id,
                topic=request.topic
            )
            await _save_new_session(new_doc)

        # Build clean snapshot of the complete transcript
        clean_history = [
            build_message_entry(
                "teacher" if str(msg.get("role", "")).lower() in ["teacher", "user"] else "student",
                str(msg.get("content", ""))
            )
            for msg in request.conversation_history
            if msg.get("content")
        ]

        updates = {
            "status": "completed",
            "evaluation": evaluation_data,
            "overall_score": overall_score,
            "message_count": len(clean_history)
        }
        if clean_history:
            updates["conversation_history"] = clean_history

        await _update_session(active_session_id, updates)

    return EndSessionResponse(
        evaluation=EvaluationReport(**evaluation_data),
        topic=request.topic,
        session_id=active_session_id,
        overall_score=overall_score,
        status="success"
    )


# ---------------------------------------------------------------------------
# GET /sessions  — List all past sessions
# ---------------------------------------------------------------------------
@router.get(
    "/sessions",
    response_model=List[SessionListItem],
    summary="List All Teaching Sessions",
    description="Returns all sessions (completed and active) sorted by most recent first. Can filter by user_id."
)
async def list_sessions_new(
    user_id: Optional[str] = Query(None, description="Filter sessions by user_id"),
    current_user: dict = Depends(get_required_current_user)
):
    uid = current_user.get("user_id", current_user.get("id"))
    all_sessions = await _list_all_sessions(user_id=uid)
    result = []
    for s in all_sessions:
        result.append(SessionListItem(
            id=s.get("session_id", s.get("id", "")),
            topic=s.get("topic", "Untitled"),
            student_level=s.get("student_level", "Beginner"),
            status=s.get("status", "active"),
            created_at=s.get("created_at", ""),
            message_count=s.get("message_count", len(s.get("conversation_history", s.get("messages", [])))),
            overall_score=s.get("overall_score"),
            user_id=s.get("user_id")
        ))
    return result


# ---------------------------------------------------------------------------
# GET /session/progress & /sessions/progress — Learning Progress Analytics
# ---------------------------------------------------------------------------
@router.get(
    "/session/progress",
    response_model=ProgressAnalyticsResponse,
    summary="Get Learning Progress Analytics",
    description="Calculates comprehensive learning progress analytics across all completed sessions for the authenticated student."
)
@router.get(
    "/sessions/progress",
    response_model=ProgressAnalyticsResponse,
    include_in_schema=False
)
async def get_learning_progress(
    current_user: dict = Depends(get_required_current_user)
):
    uid = current_user.get("user_id", current_user.get("id"))
    all_sessions = await _list_all_sessions(user_id=uid)

    # Filter strictly for completed sessions with evaluation reports
    completed = []
    for s in all_sessions:
        if s.get("status") == "completed" and s.get("evaluation"):
            completed.append(s)

    empty_response = ProgressAnalyticsResponse(
        has_data=False,
        total_completed_sessions=0,
        total_topics_explored=0,
        avg_understanding=0.0,
        avg_clarity=0.0,
        avg_accuracy=0.0,
        avg_overall=0.0,
        timeline=[],
        topic_performance=[],
        performance_distribution=PerformanceDistribution(mastered=0, proficient=0, needs_work=0),
        strongest_topics=[],
        topics_needing_improvement=[],
        frequent_knowledge_gaps=[],
        frequent_misconceptions=[],
        suggested_revision_topics=[],
        recent_sessions=[]
    )

    if not completed:
        return empty_response

    # Chronological sort for timeline (earliest to latest)
    sorted_chrono = sorted(completed, key=lambda x: str(x.get("created_at", "")))

    timeline = []
    understanding_scores = []
    clarity_scores = []
    accuracy_scores = []
    overall_scores = []

    topic_map = {}
    knowledge_gap_counter = {}
    misconception_counter = {}
    revision_counter = {}

    distribution = {"mastered": 0, "proficient": 0, "needs_work": 0}

    for s in sorted_chrono:
        eval_data = s.get("evaluation") or {}
        u = float(eval_data.get("understanding_score", 0))
        c = float(eval_data.get("clarity_score", 0))
        a = float(eval_data.get("accuracy_score", 0))

        # Overall percentage score (0-100)
        ov = s.get("overall_score")
        if ov is None:
            ov = compute_overall_score(eval_data) or int(round(((u + c + a) / 30.0) * 100))
        else:
            ov = float(ov)

        understanding_scores.append(u)
        clarity_scores.append(c)
        accuracy_scores.append(a)
        overall_scores.append(ov)

        if ov >= 80:
            distribution["mastered"] += 1
        elif ov >= 60:
            distribution["proficient"] += 1
        else:
            distribution["needs_work"] += 1

        topic_name = str(s.get("topic") or "Untitled").strip()
        created_at_str = str(s.get("created_at", ""))
        date_label = created_at_str[:10] if len(created_at_str) >= 10 else "Session"

        timeline.append(TimelineDataPoint(
            session_id=str(s.get("session_id", s.get("id", ""))),
            date=date_label,
            topic=topic_name,
            understanding_score=round(u, 1),
            clarity_score=round(c, 1),
            accuracy_score=round(a, 1),
            overall_score=round(ov, 1)
        ))

        # Topic aggregation
        if topic_name not in topic_map:
            topic_map[topic_name] = []
        topic_map[topic_name].append({
            "understanding": u,
            "clarity": c,
            "accuracy": a,
            "overall": ov
        })

        # Count actual knowledge gaps, misconceptions, revision topics
        for gap in eval_data.get("knowledge_gaps", []):
            if isinstance(gap, str) and gap.strip():
                clean_gap = gap.strip()
                knowledge_gap_counter[clean_gap] = knowledge_gap_counter.get(clean_gap, 0) + 1

        for misc in eval_data.get("misconceptions", []):
            if isinstance(misc, str) and misc.strip():
                clean_misc = misc.strip()
                misconception_counter[clean_misc] = misconception_counter.get(clean_misc, 0) + 1

        for rev in eval_data.get("revision_topics", []):
            if isinstance(rev, str) and rev.strip():
                clean_rev = rev.strip()
                revision_counter[clean_rev] = revision_counter.get(clean_rev, 0) + 1

    # Topic performance summary
    topic_performance = []
    for top, items in topic_map.items():
        n = len(items)
        topic_performance.append(TopicPerformance(
            topic=top,
            session_count=n,
            avg_understanding=round(sum(x["understanding"] for x in items) / n, 1),
            avg_clarity=round(sum(x["clarity"] for x in items) / n, 1),
            avg_accuracy=round(sum(x["accuracy"] for x in items) / n, 1),
            avg_overall=round(sum(x["overall"] for x in items) / n, 1)
        ))

    # Sort topics by performance
    sorted_topics = sorted(topic_performance, key=lambda t: t.avg_overall, reverse=True)
    strongest_topics = [t.topic for t in sorted_topics if t.avg_overall >= 70][:5]
    if not strongest_topics and sorted_topics:
        strongest_topics = [sorted_topics[0].topic]

    topics_needing_improvement = [t.topic for t in reversed(sorted_topics) if t.avg_overall < 70][:5]
    if not topics_needing_improvement and len(sorted_topics) > 1:
        topics_needing_improvement = [sorted_topics[-1].topic]

    frequent_knowledge_gaps = [
        item for item, _ in sorted(knowledge_gap_counter.items(), key=lambda x: x[1], reverse=True)[:5]
    ]
    frequent_misconceptions = [
        item for item, _ in sorted(misconception_counter.items(), key=lambda x: x[1], reverse=True)[:5]
    ]

    suggested_revision = [
        item for item, _ in sorted(revision_counter.items(), key=lambda x: x[1], reverse=True)[:5]
    ]
    for top in topics_needing_improvement:
        if top not in suggested_revision and len(suggested_revision) < 5:
            suggested_revision.append(top)

    total_n = len(completed)
    avg_u = round(sum(understanding_scores) / total_n, 1)
    avg_c = round(sum(clarity_scores) / total_n, 1)
    avg_a = round(sum(accuracy_scores) / total_n, 1)
    avg_ov = round(sum(overall_scores) / total_n, 1)

    # Recent completed sessions (most recent first) for direct navigation
    recent_sessions = []
    for s in sorted(completed, key=lambda x: str(x.get("created_at", "")), reverse=True)[:10]:
        recent_sessions.append({
            "session_id": str(s.get("session_id", s.get("id", ""))),
            "topic": str(s.get("topic", "Untitled")),
            "created_at": str(s.get("created_at", "")),
            "overall_score": s.get("overall_score"),
            "understanding_score": s.get("evaluation", {}).get("understanding_score"),
            "clarity_score": s.get("evaluation", {}).get("clarity_score"),
            "accuracy_score": s.get("evaluation", {}).get("accuracy_score")
        })

    return ProgressAnalyticsResponse(
        has_data=True,
        total_completed_sessions=total_n,
        total_topics_explored=len(topic_map),
        avg_understanding=avg_u,
        avg_clarity=avg_c,
        avg_accuracy=avg_a,
        avg_overall=avg_ov,
        timeline=timeline,
        topic_performance=topic_performance,
        performance_distribution=PerformanceDistribution(**distribution),
        strongest_topics=strongest_topics,
        topics_needing_improvement=topics_needing_improvement,
        frequent_knowledge_gaps=frequent_knowledge_gaps,
        frequent_misconceptions=frequent_misconceptions,
        suggested_revision_topics=suggested_revision,
        recent_sessions=recent_sessions
    )


# ---------------------------------------------------------------------------
# GET /sessions/{session_id}  — Full session detail
# ---------------------------------------------------------------------------
@router.get(
    "/sessions/{session_id}",
    response_model=SessionDetailResponse,
    summary="Get Session Detail",
    description="Returns the complete session including conversation transcript and evaluation report."
)
async def get_session_detail(
    session_id: str,
    current_user: dict = Depends(get_required_current_user)
):
    doc = await _get_session_doc(session_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )
    uid = current_user.get("user_id", current_user.get("id"))
    if doc.get("user_id") and doc.get("user_id") != uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this session."
        )
    return SessionDetailResponse(
        id=doc.get("session_id", session_id),
        topic=doc.get("topic", ""),
        student_level=doc.get("student_level", "Beginner"),
        status=doc.get("status", "active"),
        conversation_history=doc.get("conversation_history", doc.get("messages", [])),
        evaluation=doc.get("evaluation"),
        overall_score=doc.get("overall_score"),
        user_id=doc.get("user_id"),
        created_at=doc.get("created_at", ""),
        updated_at=doc.get("updated_at", "")
    )


# ---------------------------------------------------------------------------
# Legacy endpoints (backward compatibility — kept unchanged)
# ---------------------------------------------------------------------------

@router.post("/session", response_model=SessionResponse, summary="[Legacy] Create Session", include_in_schema=False)
async def create_session_legacy(request: CreateSessionRequest):
    session_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    initial_message = {
        "role": "student",
        "content": f"Hi! I'm really looking forward to learning about '{request.topic}'. Where should we begin?",
        "timestamp": now
    }
    doc = {
        "session_id": session_id,
        "id": session_id,
        "topic": request.topic,
        "student_level": request.student_level or "Beginner",
        "status": "active",
        "created_at": now,
        "updated_at": now,
        "messages": [initial_message],
        "conversation_history": [],
        "evaluation": None,
        "message_count": 0,
        "overall_score": None
    }
    await _save_new_session(doc)
    return SessionResponse(
        id=session_id,
        topic=request.topic,
        student_level=request.student_level or "Beginner",
        status="active",
        created_at=now,
        updated_at=now,
        messages=[initial_message],
        evaluation=None
    )


@router.get("/session", response_model=List[SessionListItem], summary="[Legacy] List Sessions", include_in_schema=False)
async def list_sessions_legacy():
    all_sessions = await _list_all_sessions()
    result = []
    for s in all_sessions:
        result.append(SessionListItem(
            id=s.get("session_id", s.get("id", "")),
            topic=s.get("topic", "Untitled"),
            student_level=s.get("student_level", "Beginner"),
            status=s.get("status", "active"),
            created_at=s.get("created_at", ""),
            message_count=s.get("message_count", len(s.get("conversation_history", s.get("messages", [])))),
            overall_score=s.get("overall_score")
        ))
    return result


@router.get("/session/{session_id}", response_model=SessionDetailResponse, summary="[Legacy] Get Session", include_in_schema=False)
async def get_session_legacy(session_id: str):
    return await get_session_detail(session_id)
