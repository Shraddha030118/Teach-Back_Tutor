import React from 'react';
import { Bot, User, Sparkles } from 'lucide-react';
import '../styles/ChatMessage.css';

const ChatMessage = ({ message }) => {
  const { role, content, timestamp, senderName } = message;
  const isTeacher = role === 'teacher' || role === 'user';

  const formatTime = (ts) => {
    if (!ts) return '';
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className={`chat-message-row ${isTeacher ? 'teacher-row' : 'student-row'}`}>
      <div className="message-avatar-box">
        {isTeacher ? (
          <div className="avatar teacher-avatar" title="You (Teacher)">
            <User size={18} />
          </div>
        ) : (
          <div className="avatar student-avatar" title="Curious Student (AI)">
            <Bot size={18} />
          </div>
        )}
      </div>

      <div className="message-content-wrapper">
        <div className="message-meta-header">
          <span className="sender-display-name">
            {isTeacher ? 'You (Teacher)' : (senderName || 'Curious Student')}
          </span>
          {!isTeacher && <span className="student-pill">AI Learner</span>}
          {timestamp && <span className="message-timestamp">{formatTime(timestamp)}</span>}
        </div>

        <div className={`message-bubble ${isTeacher ? 'teacher-bubble' : 'student-bubble'}`}>
          <p className="bubble-text">{content}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
