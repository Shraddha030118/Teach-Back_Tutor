import os
import sys
import json
from dotenv import load_dotenv

sys.path.insert(0, r"d:\Teach-Back-Tutor\backend")
load_dotenv(r"d:\Teach-Back-Tutor\backend\.env")

from services.ai_service import generate_student_response, get_gemini_client
from services.evaluation_service import evaluate_session_transcript
from fastapi import HTTPException

print("=" * 70)
print("TEACH-BACK TUTOR AI TEST SUITE")
print("=" * 70)

results = {
    "conversation_tests": [],
    "evaluation_tests": [],
    "error_handling_tests": []
}

# ---------------------------------------------------------------------------
# PART 1: TEST AI CONVERSATION BEHAVIOUR (5 TOPICS)
# ---------------------------------------------------------------------------
topics_to_test = [
    {
        "topic": "Photosynthesis",
        "explanation": "Photosynthesis is the process where plants take sunlight, carbon dioxide from the air, and water through roots, and turn them into glucose for food while releasing oxygen into the air.",
        "history": []
    },
    {
        "topic": "Artificial Intelligence",
        "explanation": "AI is basically software that learns patterns from massive amounts of data instead of following hardcoded if-else rules. Neural networks adjust weights to get better at predicting things.",
        "history": []
    },
    {
        "topic": "DBMS",
        "explanation": "A Database Management System lets you store and query structured data reliably. It uses tables with rows and columns, and enforces ACID properties so transactions don't corrupt the data.",
        "history": []
    },
    {
        "topic": "Python Basics",
        "explanation": "In Python, you don't need to declare variable types. You can create lists, dictionaries, and loops using simple indentation instead of curly braces.",
        "history": []
    },
    {
        "topic": "Solar System",
        "explanation": "The solar system has the Sun at the center, with eight planets orbiting around it held by gravity. The inner planets are rocky and the outer planets are gas giants.",
        "history": []
    },
    # Bonus edge test: Teacher says something wrong to test misconception challenge
    {
        "topic": "Photosynthesis",
        "explanation": "Plants do photosynthesis by breathing in oxygen and breathing out carbon dioxide at all times, and sunlight just heats up the leaves.",
        "history": [
            {"role": "student", "content": "Hi! Can you teach me what plants do?"}
        ]
    },
    # Bonus edge test: Teacher tries to make AI explain
    {
        "topic": "DBMS",
        "explanation": "Can you explain what a relational database is and what ACID stands for?",
        "history": []
    }
]

print("\n--- 1. Testing AI Conversation Behaviour across Topics ---")
for idx, test in enumerate(topics_to_test, 1):
    topic = test["topic"]
    explanation = test["explanation"]
    history = test["history"]
    print(f"\n[Test 1.{idx}] Topic: {topic}")
    print(f"Teacher said: '{explanation[:80]}...'")
    try:
        reply = generate_student_response(topic, explanation, history)
        print(f"AI Student Reply: \"{reply}\"")
        
        # Behavior checks
        has_question = "?" in reply
        question_count = reply.count("?")
        is_concise = len(reply.split()) <= 80
        not_teacher = not any(w in reply.lower() for w in ["correct!", "good job", "as an ai", "grade", "score:", "today we will learn"])
        
        status = "PASSED" if (has_question and question_count <= 3 and is_concise and not_teacher) else "FLAGGED"
        print(f"Status: {status} (Questions: {question_count}, Words: {len(reply.split())}, Beginner persona: {not_teacher})")
        results["conversation_tests"].append({
            "topic": topic,
            "teacher_input": explanation,
            "ai_reply": reply,
            "questions_count": question_count,
            "word_count": len(reply.split()),
            "status": status
        })
    except Exception as e:
        print(f"Status: FAILED with error: {e}")
        results["conversation_tests"].append({
            "topic": topic,
            "error": str(e),
            "status": "FAILED"
        })

# ---------------------------------------------------------------------------
# PART 2: TEST EVALUATION ACCURACY (5 STUDENT EXAMPLES)
# ---------------------------------------------------------------------------
print("\n--- 2. Testing Evaluation Accuracy across 5 Student Profiles ---")

eval_profiles = [
    {
        "name": "Profile A: Complete, correct explanation with analogies",
        "topic": "Photosynthesis",
        "transcript": [
            {"role": "teacher", "content": "Photosynthesis is the biological process green plants use to convert light energy into chemical energy. Think of a plant leaf like a tiny solar-powered kitchen."},
            {"role": "student", "content": "A kitchen? What ingredients does this kitchen use?"},
            {"role": "teacher", "content": "Great question! The ingredients are water absorbed from soil by roots, carbon dioxide taken in through tiny leaf pores called stomata, and photons from sunlight captured by green chlorophyll."},
            {"role": "student", "content": "And what dish comes out of the kitchen?"},
            {"role": "teacher", "content": "It produces glucose sugar, which is the plant's food, and it releases oxygen as a vital byproduct that humans and animals breathe."}
        ]
    },
    {
        "name": "Profile B: Incomplete explanation (missing key mechanisms)",
        "topic": "Photosynthesis",
        "transcript": [
            {"role": "teacher", "content": "Photosynthesis is when plants grow using sunlight and water."},
            {"role": "student", "content": "How does sunlight help them grow? What happens inside?"},
            {"role": "teacher", "content": "They just absorb it and become green."}
        ]
    },
    {
        "name": "Profile C: Blatantly incorrect information & misconceptions",
        "topic": "Photosynthesis",
        "transcript": [
            {"role": "teacher", "content": "Photosynthesis is when plants breathe in pure oxygen and exhale carbon dioxide, just like human lungs."},
            {"role": "student", "content": "Wait, I thought plants made oxygen for us to breathe?"},
            {"role": "teacher", "content": "No, plants absorb soil rocks directly and create water from electricity inside leaves."}
        ]
    },
    {
        "name": "Profile D: Very short, minimal one-word/terse answers",
        "topic": "Python Basics",
        "transcript": [
            {"role": "teacher", "content": "Python is a language."},
            {"role": "student", "content": "What kind of language? How do you write it?"},
            {"role": "teacher", "content": "Code."}
        ]
    },
    {
        "name": "Profile E: Clear explanation with real-world examples",
        "topic": "Database Management Systems",
        "transcript": [
            {"role": "teacher", "content": "A DBMS is software like PostgreSQL or MySQL that organizes data into tables, like sophisticated Excel sheets linked together."},
            {"role": "student", "content": "Why not just use an Excel spreadsheet then?"},
            {"role": "teacher", "content": "Because if millions of users book flight tickets at the exact same second, Excel would crash or double-book seats. A DBMS guarantees ACID properties, meaning either the whole booking transaction succeeds or nothing changes."}
        ]
    }
]

for idx, profile in enumerate(eval_profiles, 1):
    name = profile["name"]
    topic = profile["topic"]
    transcript = profile["transcript"]
    print(f"\n[Test 2.{idx}] {name}")
    try:
        report = evaluate_session_transcript(topic, transcript)
        clarity = report["clarity_score"]
        understanding = report["understanding_score"]
        accuracy = report["accuracy_score"]
        avg = round((clarity + understanding + accuracy) / 3, 1)
        print(f"Scores -> Clarity: {clarity}/10, Understanding: {understanding}/10, Accuracy: {accuracy}/10 (Avg: {avg}/10)")
        print(f"Strengths ({len(report['strengths'])}): {report['strengths'][:2]}")
        print(f"Knowledge Gaps ({len(report['knowledge_gaps'])}): {report['knowledge_gaps'][:2]}")
        print(f"Misconceptions ({len(report['misconceptions'])}): {report['misconceptions'][:2]}")
        print(f"Overall Feedback: {report['overall_feedback'][:120]}...")
        
        results["evaluation_tests"].append({
            "profile": name,
            "scores": {"clarity": clarity, "understanding": understanding, "accuracy": accuracy, "avg": avg},
            "misconceptions_count": len(report["misconceptions"]),
            "gaps_count": len(report["knowledge_gaps"]),
            "status": "PASSED"
        })
    except Exception as e:
        print(f"FAILED with error: {e}")
        results["evaluation_tests"].append({
            "profile": name,
            "error": str(e),
            "status": "FAILED"
        })

# ---------------------------------------------------------------------------
# PART 3: TEST ERROR HANDLING
# ---------------------------------------------------------------------------
print("\n--- 3. Testing Error Handling & Edge Cases ---")

error_cases = [
    {
        "name": "Empty student explanation to ai_service",
        "fn": lambda: generate_student_response("Photosynthesis", "   "),
        "expected_code": 400
    },
    {
        "name": "Empty topic to ai_service",
        "fn": lambda: generate_student_response("", "Plants turn sunlight into food"),
        "expected_code": 400
    },
    {
        "name": "Empty transcript to evaluation_service",
        "fn": lambda: evaluate_session_transcript("Photosynthesis", []),
        "expected_code": 400
    },
    {
        "name": "Transcript with no teacher message to evaluation_service",
        "fn": lambda: evaluate_session_transcript("Photosynthesis", [{"role": "student", "content": "Hi there!"}]),
        "expected_code": 400
    }
]

for idx, ec in enumerate(error_cases, 1):
    name = ec["name"]
    fn = ec["fn"]
    exp = ec["expected_code"]
    print(f"\n[Test 3.{idx}] {name}")
    try:
        fn()
        print("FAILED: Expected HTTPException but call succeeded!")
        results["error_handling_tests"].append({"name": name, "status": "FAILED"})
    except HTTPException as he:
        if he.status_code == exp:
            print(f"PASSED: Correctly caught HTTPException {he.status_code} - '{he.detail}'")
            results["error_handling_tests"].append({"name": name, "status": "PASSED", "detail": he.detail})
        else:
            print(f"FLAGGED: Expected {exp} but got {he.status_code}")
            results["error_handling_tests"].append({"name": name, "status": "FLAGGED"})
    except Exception as ex:
        print(f"FLAGGED: Unexpected exception type: {type(ex)} - {ex}")
        results["error_handling_tests"].append({"name": name, "status": "FLAGGED", "error": str(ex)})

# Save full results to JSON file
with open(r"d:\Teach-Back-Tutor\backend\test_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("\n" + "=" * 70)
print("TEST EXECUTION COMPLETED. Results written to backend/test_results.json")
print("=" * 70)
