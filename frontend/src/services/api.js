import axios from 'axios';

// Get base URL from environment or fallback to localhost:8000
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// Strip trailing slashes to avoid double-slashes in endpoint paths
const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

// In production, warn if VITE_API_URL was not set at build time
if (
  typeof window !== 'undefined' &&
  !import.meta.env.VITE_API_URL &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
) {
  console.warn(
    '[Teach-Back Tutor] Warning: VITE_API_URL is not configured for this deployment. ' +
    'The app is currently falling back to http://localhost:8000. ' +
    'Please set VITE_API_URL in your hosting platform (Vercel, Netlify, Render) to your deployed backend URL.'
  );
}

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000   // 60s — Gemini can be slow
});

// Request interceptor: attach JWT bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tbt_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Authentication ──────────────────────────────────────────────────────────

/**
 * Register a new user account.
 * Returns { token, token_type, user, status, message }
 */
export const registerUser = async (name, email, password) => {
  const response = await api.post('/auth/register', {
    name,
    email,
    password
  });
  return response.data;
};

/**
 * Log in an existing user with email and password.
 * Returns { token, token_type, user, status, message }
 */
export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', {
    email,
    password
  });
  return response.data;
};

/**
 * Fetch profile of the currently authenticated user.
 * Returns { id, name, email, created_at }
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// ─── Session lifecycle ───────────────────────────────────────────────────────

/**
 * Creates a new session in the backend.
 * Returns { session_id, topic, status, created_at, persisted }
 * Call this once when the user enters the chat page.
 */
export const startSession = async (topic, studentLevel = 'Beginner', userId = null) => {
  const response = await api.post('/session/start', {
    topic,
    student_level: studentLevel,
    user_id: userId
  });
  return response.data;
};

/**
 * Sends the teacher's explanation to the AI student.
 * Pass session_id to enable MongoDB persistence.
 * Returns { ai_response, topic, session_id, status }
 */
export const sendSessionMessage = async (topic, studentMessage, conversationHistory, sessionId = null, userId = null) => {
  const response = await api.post('/session/message', {
    topic,
    student_message: studentMessage,
    conversation_history: conversationHistory || [],
    session_id: sessionId,
    user_id: userId
  });
  return response.data;
};

/**
 * Ends the session and generates a Gemini evaluation report.
 * Pass session_id to save the report to MongoDB.
 * Returns { evaluation, topic, session_id, overall_score, status }
 */
export const endSessionAndEvaluate = async (topic, conversationHistory, sessionId = null) => {
  const response = await api.post('/session/end', {
    topic,
    conversation_history: conversationHistory || [],
    session_id: sessionId
  });
  return response.data;
};

// ─── Session history ─────────────────────────────────────────────────────────

/**
 * Returns past sessions (most recent first).
 * If userId is provided, filters sessions belonging to that user.
 * Each item: { id, topic, student_level, status, created_at, message_count, overall_score, user_id }
 */
export const getSessions = async (userId = null) => {
  const config = userId ? { params: { user_id: userId } } : {};
  const response = await api.get('/sessions', config);
  return response.data;
};

/**
 * Returns the full detail for one session including conversation + evaluation.
 */
export const getSessionById = async (sessionId) => {
  const response = await api.get(`/sessions/${sessionId}`);
  return response.data;
};

/**
 * Returns learning progress analytics across completed sessions for the authenticated user.
 */
export const getLearningProgress = async () => {
  const response = await api.get('/session/progress');
  return response.data;
};

// ─── Health ──────────────────────────────────────────────────────────────────

export const checkBackendHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// ─── Legacy helpers (kept for backward compatibility) ────────────────────────

export const createSession = async (topic, studentLevel = 'Beginner') => {
  const response = await api.post('/session', { topic, student_level: studentLevel });
  return response.data;
};

export const getSession = async (sessionId) => {
  const response = await api.get(`/sessions/${sessionId}`);
  return response.data;
};

export default api;
