import React, { useState, useRef, useEffect } from 'react';
import { SendHorizonal, Sparkles } from 'lucide-react';
import '../styles/ChatInput.css';

const ChatInput = ({ onSendMessage, disabled, placeholder }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const cleanText = text.trim();
    if (!cleanText || disabled) return;
    
    onSendMessage(cleanText);
    setText('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Dynamic textarea expansion
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  return (
    <div className="chat-input-container">
      <form className="chat-input-card" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Explain this concept in your own words... (Press Enter to send)"}
          disabled={disabled}
          className="chat-textarea-field"
        />

        <div className="input-actions-bar">
          <span className="input-hint-text">
            <span>Enter ↵</span> to send • <span>Shift + Enter</span> for new line
          </span>

          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className={`chat-send-btn ${text.trim() ? 'active' : ''}`}
            title="Send your explanation"
          >
            <span>Send</span>
            <SendHorizonal size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
