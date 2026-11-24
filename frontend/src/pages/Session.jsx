import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Bot, 
  Sparkles, 
  LogOut, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Lightbulb,
  BookOpen,
  Brain,
  MessageSquare,
  AlertTriangle,
  X,
  Database
} from 'lucide-react';
import teachBackTutorLogo from '../assets/teach-back-tutor-logo.png';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { startSession, sendSessionMessage, endSessionAndEvaluate, getSessionById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/Session.css';

const Session = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  // Selected topic resolution (from router state, URL param, or default)
  const [topicName, setTopicName] = useState(
    location.state?.topic || (!id || id.length > 30 ? 'Photosynthesis' : decodeURIComponent(id))
  );
  const categoryName = location.state?.category || 'Learning Classroom';

  // Chat conversation state
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      role: 'student',
      senderName: 'Curious Student',
      content: "Hey! I've never learned this topic before. Can you teach me? I'll ask questions whenever something confuses me!",
      timestamp: new Date().toISOString()
    }
  ]);

  const [showEndModal, setShowEndModal] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [dbPersisted, setDbPersisted] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const messagesEndRef = useRef(null);
  const hasInitializedRef = useRef(false);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiThinking]);

  // Initialize or restore session on mount
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const init = async () => {
      // Case A: id is in URL -> Resuming existing session or loading from history
      if (id && id.length > 10) {
        setIsLoadingSession(true);
        try {
          const sessionData = await getSessionById(id);
          if (sessionData) {
            setSessionId(sessionData.id);
            setDbPersisted(true);
            if (sessionData.topic) {
              setTopicName(sessionData.topic);
            }
            // Restore previous conversation history if exists
            if (sessionData.conversation_history && sessionData.conversation_history.length > 0) {
              const restoredMessages = sessionData.conversation_history.map((m, idx) => ({
                id: `restored-${idx}`,
                role: m.role === 'teacher' ? 'teacher' : 'student',
                senderName: m.role === 'teacher' ? 'You (Teacher)' : 'Curious Student',
                content: m.content,
                timestamp: m.timestamp || new Date().toISOString()
              }));
              setMessages(restoredMessages);
            }
            // If already evaluated, give option to view report
            if (sessionData.status === 'completed' && sessionData.evaluation) {
              navigate(`/report/${sessionData.id}`);
              return;
            }
          }
        } catch (err) {
          console.warn('Could not restore session from backend, starting fresh session:', err);
          // Fallback: start fresh session
          startFresh();
        } finally {
          setIsLoadingSession(false);
        }
      } else {
        // Case B: Brand new session
        startFresh();
      }
    };

    const startFresh = async () => {
      try {
        const currentTopic = location.state?.topic || topicName || 'Photosynthesis';
        const data = await startSession(currentTopic, 'Beginner', user?.id);
        setSessionId(data.session_id);
        setDbPersisted(data.persisted);
      } catch (err) {
        console.warn('Could not create session on backend — continuing in in-memory mode.', err);
      }
    };

    init();
  }, [id]);

  // Handle user sending an explanation to the AI student
  const handleSendMessage = async (text) => {
    if (!text.trim() || isAiThinking || isEvaluating) return;

    setErrorMessage('');

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'teacher',
      senderName: 'You (Teacher)',
      content: text.trim(),
      timestamp: new Date().toISOString()
    };

    // 1. Immediately append user message to local state
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setIsAiThinking(true);

    try {
      // 2. Build a clean conversation history for the backend:
      //    - Only include teacher/student messages (skip the initial greeting)
      //    - Map to simple { role, content } objects the backend expects
      //    - Gemini requires the first message to be from "user" (teacher)
      //    - Skip the very first student greeting message (index 0)
      const cleanHistory = updatedHistory
        .slice(1) // skip the initial AI greeting (index 0) — Gemini cannot start with "model"
        .filter(m => m.content && m.content.trim())
        .map(m => ({
          role: m.role === 'teacher' ? 'teacher' : 'student',
          content: m.content.trim()
        }));

      // 3. Call FastAPI backend -> POST /session/message
      const response = await sendSessionMessage(topicName, text.trim(), cleanHistory, sessionId, user?.id);
      
      const aiReply = {
        id: `msg-${Date.now() + 1}`,
        role: 'student',
        senderName: 'Curious Student',
        content: response.ai_response,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error('Failed to get student response:', err);
      const detail = err.response?.data?.message || err.response?.data?.detail || 'Unable to communicate with the AI student. Make sure the FastAPI server is running on port 8000.';
      setErrorMessage(detail);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Open the End Session modal
  const handleEndSessionClick = () => {
    setErrorMessage('');
    setShowEndModal(true);
  };

  // Confirm End Session & Request Gemini Evaluation Report
  const confirmEndSessionAndEvaluate = async () => {
    const teacherCount = messages.filter(m => m.role === 'teacher').length;
    if (teacherCount === 0) {
      setErrorMessage("Please teach the student with at least one explanation before requesting an evaluation!");
      return;
    }

    try {
      setIsEvaluating(true);
      setErrorMessage('');

      // Build clean history for evaluation (same cleanup as chat)
      const cleanHistory = messages
        .slice(1)
        .filter(m => m.content && m.content.trim())
        .map(m => ({
          role: m.role === 'teacher' ? 'teacher' : 'student',
          content: m.content.trim()
        }));

      // Call FastAPI backend -> POST /session/end
      const response = await endSessionAndEvaluate(topicName, cleanHistory, sessionId);

      setShowEndModal(false);
      // Navigate to /report passing the evaluation report, topic, and session_id
      navigate('/report', {
        state: {
          evaluation: response.evaluation,
          topic: response.topic || topicName,
          sessionId: response.session_id || sessionId,
          overallScore: response.overall_score
        }
      });
    } catch (err) {
      console.error('Evaluation error:', err);
      const detail = err.response?.data?.message || err.response?.data?.detail || 'Evaluation request failed. Please verify your backend server.';
      setErrorMessage(detail);
      setIsEvaluating(false);
    }
  };

  const starterPrompts = [
    `Here is the basic definition of ${topicName}...`,
    `Think of ${topicName} like this simple analogy...`,
    `The three most important things to know about ${topicName} are...`
  ];

  const handleUsePrompt = (prompt) => {
    handleSendMessage(prompt);
  };

  const teacherMessagesCount = messages.filter(m => m.role === 'teacher').length;

  return (
    <div className="classroom-session-page">
      {/* 1. Header Section */}
      <header className="classroom-header">
        <div className="classroom-header-inner">
          {/* Logo & Brand */}
          <Link to="/" className="classroom-logo-link" title="Return to Home">
            <img 
              src={teachBackTutorLogo} 
              alt="Teach-Back Tutor Logo" 
              className="classroom-brand-logo" 
            />
          </Link>

          {/* Topic Title & Session Status */}
          <div className="classroom-topic-center">
            <div className="topic-title-row">
              <span className="topic-category-pill">{categoryName}</span>
              <h2 className="active-topic-name">{topicName}</h2>
            </div>
            <div className="session-status-badge">
              <span className="live-dot-pulse"></span>
              <span className="live-status-text">
                {isLoadingSession ? 'Loading Session...' : (dbPersisted ? 'Live • Auto-Saving' : 'Live Teaching Session')}
              </span>
            </div>
          </div>

          {/* End Session Action */}
          <div className="classroom-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ThemeToggle />
            <Link 
              to="/topics" 
              className="btn btn-secondary"
              style={{ fontSize: '0.84rem', padding: '7px 14px', borderRadius: '8px' }}
              title="Return to topic selection"
            >
              <ArrowLeft size={14} />
              <span>Topics</span>
            </Link>
            <button 
              type="button" 
              className="end-session-btn"
              onClick={handleEndSessionClick}
              disabled={isEvaluating}
              title="End current session and generate evaluation report"
            >
              <LogOut size={16} />
              <span>End Session</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="classroom-workspace">
        {/* Error Notification Banner if backend returns error */}
        {errorMessage && (
          <div className="session-error-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} className="error-icon" />
              <span>{errorMessage}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setErrorMessage('')} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '4px' }}
              title="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* 2. AI Student Profile Banner */}
        <div className="student-profile-banner">
          <div className="student-avatar-container">
            <div className="student-robot-icon">
              <Bot size={26} />
            </div>
            <div className="student-badge-indicator"></div>
          </div>

          <div className="student-details">
            <div className="student-name-row">
              <h3 className="student-name">Curious Student</h3>
              <span className="student-status-tag">Ready to learn!</span>
            </div>
            <p className="student-bio">
              "I'm new to this topic. Can you teach me?"
            </p>
          </div>

          <div className="classroom-tip-box">
            <Sparkles size={16} className="tip-sparkle" />
            <span>Feynman tip: Explain in plain terms as if speaking to a 10-year-old.</span>
          </div>
        </div>

        {/* 3. Scrollable Chat Message Area */}
        <div className="chat-viewport">
          {/* Introductory Guide Card (Empty State / Session Starter) */}
          <div className="chat-welcome-card">
            <div className="welcome-card-header">
              <Lightbulb size={20} className="welcome-bulb" />
              <h4>Teaching Session Started</h4>
            </div>
            <p className="welcome-card-text">
              You are teaching <strong>{topicName}</strong>. Your AI student has never studied this before. 
              Start by giving an intuitive explanation or analogy!
            </p>

            <div className="starter-prompts-container">
              <span className="prompts-label">Suggested conversation starters:</span>
              <div className="prompts-grid">
                {starterPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="prompt-chip-btn"
                    onClick={() => handleUsePrompt(prompt)}
                    disabled={isAiThinking}
                  >
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Render All Messages in State */}
          <div className="messages-thread">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {/* AI Student Thinking Indicator */}
            {isAiThinking && (
              <div className="chat-message-row student-row thinking-row">
                <div className="message-avatar-box">
                  <div className="avatar student-avatar">
                    <Bot size={18} />
                  </div>
                </div>
                <div className="message-content-wrapper">
                  <div className="message-meta-header">
                    <span className="sender-display-name">Curious Student</span>
                    <span className="student-pill">Formulating Question...</span>
                  </div>
                  <div className="message-bubble student-bubble thinking-bubble" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="typing-dots-animation">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span style={{ fontSize: '0.86rem', color: '#64748b', fontStyle: 'italic' }}>
                      Pondering your explanation...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 4. Fixed / Sticky Message Input Area */}
        <div className="chat-input-sticky-footer">
          <ChatInput 
            onSendMessage={handleSendMessage} 
            disabled={isAiThinking || isEvaluating}
            placeholder={`Teach the student about ${topicName}... (Press Enter to send)`}
          />
        </div>
      </div>

      {/* End Session Confirmation Modal */}
      {showEndModal && !isEvaluating && (
        <div className="modal-overlay" onClick={() => setShowEndModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-icon end-icon-bg">
              <LogOut size={28} />
            </div>
            <h3 className="modal-title">End Teaching Session?</h3>
            <p className="modal-desc">
              Would you like to conclude your teaching session on <strong>"{topicName}"</strong> and generate your AI pedagogical evaluation report?
            </p>

            {teacherMessagesCount === 0 && (
              <div className="modal-warning-box">
                <AlertTriangle size={18} />
                <span>You haven't explained anything yet. Please explain the topic before requesting an evaluation!</span>
              </div>
            )}

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowEndModal(false)}
              >
                Keep Teaching
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={confirmEndSessionAndEvaluate}
                disabled={teacherMessagesCount === 0}
              >
                <span>Evaluate & View Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen AI Evaluation Loading Screen */}
      {isEvaluating && (
        <div className="evaluating-overlay">
          <div className="evaluating-card">
            <div className="evaluating-spinner-box">
              <Brain size={44} className="spinning-brain-icon" />
            </div>
            <h3>Generating Evaluation Report...</h3>
            <p className="evaluating-desc">
              Google Gemini AI is evaluating your explanation of <strong>"{topicName}"</strong> for conceptual clarity, accuracy, and understanding.
            </p>
            <div className="evaluating-dots">
              <span className="dot dot-1"></span>
              <span className="dot dot-2"></span>
              <span className="dot dot-3"></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Session;
