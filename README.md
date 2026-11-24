# Teach-Back Tutor 🎓

Teach-Back Tutor is an AI-powered pedagogical application based on the **Feynman Technique** (the "Teach-Back" method). Instead of having an AI tutor explain concepts to you, **you teach the concept to an inquisitive AI student**.

By explaining concepts in simple terms, answering follow-up questions, and addressing student confusion, you identify your own knowledge gaps. Once the teaching session finishes, you receive a comprehensive pedagogical evaluation with scores and targeted feedback.

---

## 📁 Project Structure

```text
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   └── Loading.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Session.jsx
│   │   │   ├── Report.jsx
│   │   │   └── History.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── Home.css
│   │   │   ├── Session.css
│   │   │   └── Report.css
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   │
│   ├── routes/
│   │   └── session.py
│   │
│   ├── services/
│   │   ├── ai_service.py
│   │   └── evaluation_service.py
│   │
│   ├── prompts/
│   │   ├── student_prompt.txt
│   │   └── evaluation_prompt.txt
│   │
│   ├── database/
│   │   └── mongodb.py
│   │
│   ├── models/
│   │   └── session_model.py
│   │
│   ├── schemas/
│   │   └── session_schema.py
│   │
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **Google Gemini API Key** (Optional, fallback mock responses included for testing)

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and Gemini API Key

# Start FastAPI server
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`  
Interactive API docs at: `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 🧠 How It Works

1. **Pick a Topic & Student Level**: Choose a topic you want to master (e.g., *Quantum Computing*, *HTTP vs HTTPS*, *Recursion*) and pick your AI student's persona (Beginner, Intermediate, Advanced).
2. **Teach the AI Student**: The AI student listens, reflects what it learned, asks clarifying questions, and points out gaps or ambiguities.
3. **Finish & Evaluate**: When you feel you've covered the concept, click **Finish & Evaluate**.
4. **Review Your Feedback Report**:
   - **Conceptual Clarity Score**
   - **Accuracy & Depth Score**
   - **Use of Analogies & Examples**
   - **Responsiveness to Student Questions**
   - **Actionable Strengths & Blind Spots**
5. **Session History**: Track your progress over time in the History tab.
