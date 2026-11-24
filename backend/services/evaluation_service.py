import os
import json
import re
import time
from pathlib import Path
from typing import List, Dict, Any
from fastapi import HTTPException, status
from dotenv import load_dotenv

from services.ai_service import get_gemini_client

load_dotenv()

PROMPT_FILE = Path(__file__).resolve().parent.parent / "prompts" / "evaluation_prompt.txt"

def load_evaluation_prompt() -> str:
    """Loads the pedagogical evaluation instructions from prompt file."""
    if PROMPT_FILE.exists():
        return PROMPT_FILE.read_text(encoding="utf-8").strip()
    return "You are an expert pedagogical evaluator. Evaluate this teaching session strictly as JSON."

def sanitize_json_response(raw_text: str) -> dict:
    """
    Safely parses JSON from Gemini output, stripping any markdown wrappers if present.
    """
    clean_text = raw_text.strip()
    
    # Strip markdown ```json ... ``` if model included it
    if clean_text.startswith("```"):
        clean_text = re.sub(r"^```(?:json)?\s*", "", clean_text, flags=re.IGNORECASE)
        clean_text = re.sub(r"\s*```$", "", clean_text)
        clean_text = clean_text.strip()

    try:
        data = json.loads(clean_text)
        if isinstance(data, dict):
            return data
    except Exception:
        # Try extracting JSON object via regex
        match = re.search(r"\{.*\}", clean_text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        raise ValueError(f"Could not parse valid JSON from model response: {raw_text[:200]}")

def evaluate_session_transcript(topic: str, conversation_history: List[Dict[str, Any]]) -> dict:
    """
    Analyzes the conversation transcript using Google Gemini AI and
    generates a structured pedagogical evaluation report.
    """
    # 1. Validation: Ensure topic is provided
    if not topic or not topic.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic is required to evaluate the teaching session."
        )

    # 2. Validation: Ensure conversation is not empty and has teacher input
    if not conversation_history or len(conversation_history) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot evaluate an empty conversation. Please teach the student first."
        )

    teacher_messages = [
        msg for msg in conversation_history 
        if str(msg.get("role", "")).lower() in ["teacher", "user"] 
        and str(msg.get("content", "")).strip()
    ]

    if len(teacher_messages) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No explanations found from the teacher. You must explain the topic at least once before requesting an evaluation."
        )

    # 3. Format the transcript clearly for the evaluator
    formatted_transcript_lines = []
    for idx, msg in enumerate(conversation_history, 1):
        role_label = "Teacher" if str(msg.get("role", "")).lower() in ["teacher", "user"] else "Curious AI Student"
        content = str(msg.get("content", "")).strip()
        if content:
            formatted_transcript_lines.append(f"[{idx}] {role_label}: {content}")

    transcript_text = "\n\n".join(formatted_transcript_lines)

    # 4. Initialize Gemini client using existing shared client factory
    client = get_gemini_client()
    model_name = os.getenv("GEMINI_MODEL", "gemini-3.8-flash").strip()
    system_instruction = load_evaluation_prompt()

    user_prompt = (
        f"TOPIC TAUGHT: {topic.strip()}\n\n"
        f"COMPLETE TEACHING TRANSCRIPT:\n{transcript_text}\n\n"
        f"Analyze the transcript and produce the structured evaluation report in valid JSON."
    )

    try:
        from google.genai import types

        # Request pure JSON response from Gemini
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.2,  # Low temperature for objective scoring
            response_mime_type="application/json"
        )

        primary_model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip()
        candidate_models = [primary_model]
        for fallback in ["gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.8-flash"]:
            if fallback not in candidate_models:
                candidate_models.append(fallback)

        response = None
        last_exc = None

        for model_to_use in candidate_models:
            for attempt in range(1, 3):
                try:
                    response = client.models.generate_content(
                        model=model_to_use,
                        contents=user_prompt,
                        config=config
                    )
                    if response and response.text:
                        break
                except Exception as exc:
                    last_exc = exc
                    err_str = str(exc).lower()
                    if "503" in str(exc) or "unavailable" in err_str or "high demand" in err_str or "404" in str(exc) or "not found" in err_str:
                        time.sleep(1)
                        continue
                    raise exc
            if response and response.text:
                break

        if last_exc and response is None:
            raise last_exc

        if not response or not response.text:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Gemini returned an empty evaluation response. Please try again."
            )

        parsed_report = sanitize_json_response(response.text)

        # 5. Normalize and clamp scores (0 to 10 integers)
        def clamp_score(val, default=7):
            try:
                num = int(round(float(val)))
                return max(0, min(10, num))
            except (ValueError, TypeError):
                return default

        clarity_score = clamp_score(parsed_report.get("clarity_score"), 8)
        understanding_score = clamp_score(parsed_report.get("understanding_score"), 7)
        accuracy_score = clamp_score(parsed_report.get("accuracy_score"), 8)

        # 6. Ensure all required fields exist
        strengths = parsed_report.get("strengths") or []
        if not isinstance(strengths, list):
            strengths = [str(strengths)]

        knowledge_gaps = parsed_report.get("knowledge_gaps") or []
        if not isinstance(knowledge_gaps, list):
            knowledge_gaps = [str(knowledge_gaps)]

        misconceptions = parsed_report.get("misconceptions") or []
        if not isinstance(misconceptions, list):
            misconceptions = [str(misconceptions)]

        revision_topics = parsed_report.get("revision_topics") or []
        if not isinstance(revision_topics, list):
            revision_topics = [str(revision_topics)]

        overall_feedback = str(parsed_report.get("overall_feedback") or "Good session overall.").strip()

        return {
            "clarity_score": clarity_score,
            "understanding_score": understanding_score,
            "accuracy_score": accuracy_score,
            "strengths": [str(s) for s in strengths],
            "knowledge_gaps": [str(g) for g in knowledge_gaps],
            "misconceptions": [str(m) for m in misconceptions],
            "revision_topics": [str(r) for r in revision_topics],
            "overall_feedback": overall_feedback
        }

    except HTTPException:
        raise
    except Exception as exc:
        err_msg = str(exc)
        err_lower = err_msg.lower()

        if "api_key_invalid" in err_lower or "401" in err_msg or "invalid api key" in err_lower:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Gemini API key provided. Please verify GEMINI_API_KEY in backend/.env."
            )
        if "resource_exhausted" in err_lower or "429" in err_msg or "quota" in err_lower:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Gemini API rate limit or quota exceeded. Please wait a moment and try again."
            )
        if "503" in err_msg or "unavailable" in err_lower or "high demand" in err_lower:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Gemini API is temporarily overloaded. Please wait a moment and try again."
            )
        if "connect" in err_lower or "timeout" in err_lower or "network" in err_lower:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Network error: Unable to connect to Gemini API for evaluation."
            )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Evaluation failed: {err_msg}"
        )
