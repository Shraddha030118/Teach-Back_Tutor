import os
import time
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

PROMPT_FILE = Path(__file__).resolve().parent.parent / "prompts" / "student_prompt.txt"

def load_student_prompt() -> str:
    """
    Loads the student personality prompt from backend/prompts/student_prompt.txt.
    """
    if PROMPT_FILE.exists():
        return PROMPT_FILE.read_text(encoding="utf-8").strip()
    return (
        "You are a curious student learning a topic for the first time. "
        "The user is your teacher. Ask 1-2 short, conversational questions to discover gaps in understanding."
    )

def get_gemini_client():
    """
    Initializes and returns the official Google Gen AI client.
    Validates that GEMINI_API_KEY is present in environment variables.
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    if not api_key or api_key == "your_gemini_api_key_here":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY is missing or not configured. Please add your API key to backend/.env"
        )

    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "The official 'google-genai' SDK is not installed. "
                "Please run: pip install google-genai"
            )
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize Gemini client: {str(e)}"
        )

def generate_student_response(
    topic: str,
    student_message: str,
    conversation_history: Optional[List[Dict[str, Any]]] = None
) -> str:
    """
    Sends the teacher's explanation to Gemini along with conversation history.
    Returns 1-2 curious, in-character student questions.
    """
    # 1. Validate empty inputs
    if not student_message or not student_message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student message cannot be empty. Please provide an explanation."
        )

    if not topic or not topic.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic must be specified."
        )

    # 2. Get initialized client
    client = get_gemini_client()

    # 3. Model configuration through environment variable
    model_name = os.getenv("GEMINI_MODEL", "gemini-3.8-flash").strip()

    # 4. Prepare system prompt tailored to the selected topic
    base_student_prompt = load_student_prompt()
    system_instruction = (
        f"{base_student_prompt}\n\n"
        f"SELECTED TOPIC: {topic.strip()}\n"
        f"Remember: You are the student learning '{topic.strip()}'. "
        f"Listen to the teacher's explanation, act like a confused beginner, "
        f"and ask 1-2 short, genuine, conversational questions."
    )

    try:
        from google.genai import types

        # 5. Build conversation history contents
        contents = []
        mapped_items = []

        if conversation_history:
            for item in conversation_history:
                role = str(item.get("role", "user")).lower()
                content = str(item.get("content", "")).strip()
                if not content:
                    continue

                # Map roles: 'teacher' or 'user' -> 'user', anything else -> 'model'
                mapped_role = "user" if role in ["user", "teacher"] else "model"
                mapped_items.append((mapped_role, content))

        # Gemini requires conversation to START with a 'user' message — drop any leading 'model' turns
        while mapped_items and mapped_items[0][0] == "model":
            mapped_items.pop(0)

        # Also ensure roles strictly alternate (no two consecutive same roles)
        filtered_items = []
        for mapped_role, content in mapped_items:
            if filtered_items and filtered_items[-1][0] == mapped_role:
                # Merge consecutive same-role messages
                filtered_items[-1] = (mapped_role, filtered_items[-1][1] + "\n" + content)
            else:
                filtered_items.append((mapped_role, content))

        for mapped_role, content in filtered_items:
            contents.append(
                types.Content(
                    role=mapped_role,
                    parts=[types.Part.from_text(text=content)]
                )
            )

        # Append the new teacher message
        contents.append(
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=student_message.strip())]
            )
        )

        # 6. Call Gemini API using GenerateContentConfig with model failover
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
            max_output_tokens=300
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
                        contents=contents,
                        config=config
                    )
                    if response and response.text:
                        return response.text.strip()
                except Exception as exc:
                    last_exc = exc
                    err_str = str(exc).lower()
                    # If 503 or 404, try next attempt or next candidate model
                    if "503" in str(exc) or "unavailable" in err_str or "high demand" in err_str or "404" in str(exc) or "not found" in err_str:
                        time.sleep(1)
                        continue
                    # Other fatal errors (e.g. 401 invalid key) raise immediately
                    raise exc

        if last_exc:
            raise last_exc

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini API returned an empty response. Please try again."
        )

    except HTTPException:
        # Re-raise explicit HTTP exceptions
        raise
    except Exception as exc:
        err_msg = str(exc)
        err_lower = err_msg.lower()

        # Handle Invalid API Key
        if "api_key_invalid" in err_lower or "401" in err_msg or "invalid api key" in err_lower or "permission denied" in err_lower:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Gemini API key provided. Please verify your GEMINI_API_KEY in backend/.env."
            )

        # Handle Quota / Rate Limits
        if "resource_exhausted" in err_lower or "429" in err_msg or "quota" in err_lower:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Gemini API rate limit or quota exceeded. Please wait a few moments before trying again."
            )

        # Handle 503 / High Demand
        if "503" in err_msg or "unavailable" in err_lower or "high demand" in err_lower:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Gemini API is temporarily overloaded. Please wait a moment and try again."
            )

        # Handle Network / Connection Failures
        if "connect" in err_lower or "timeout" in err_lower or "network" in err_lower or "dns" in err_lower or "connection" in err_lower:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Network connection failure: Unable to reach Google Gemini API. Please check your internet connection."
            )

        # Catch-all Gemini API error
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Google Gemini API error: {err_msg}"
        )
