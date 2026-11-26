import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SendHorizonal, Mic, MicOff, Square, X, AlertCircle } from 'lucide-react';
import '../styles/ChatInput.css';

const ChatInput = ({ onSendMessage, disabled, placeholder }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const baseTextBeforeRecording = useRef('');

  // Check Web Speech API support on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
    }
  }, []);

  // Clean up recognition resources on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  // Dynamic textarea expansion
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text, interimTranscript]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isRecording) {
      stopRecording();
    }
    const cleanText = text.trim();
    if (!cleanText || disabled) return;

    onSendMessage(cleanText);
    setText('');
    setInterimTranscript('');

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

  // Start voice recording
  const startRecording = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Voice input is not supported by your browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    if (disabled) return;

    setVoiceError('');
    baseTextBeforeRecording.current = text;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setVoiceError('');
        setInterimTranscript('');
      };

      recognition.onresult = (event) => {
        let currentInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcript;
          } else {
            currentInterim += transcript;
          }
        }

        if (finalChunk) {
          setText((prev) => {
            const trimmedPrev = prev.trim();
            const separator = trimmedPrev.length > 0 ? ' ' : '';
            return trimmedPrev + separator + finalChunk.trim();
          });
        }

        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceError('Microphone permission was denied. Please allow microphone access in your browser.');
          setIsRecording(false);
        } else if (event.error === 'audio-capture') {
          setVoiceError('No microphone found. Please connect a microphone and try again.');
          setIsRecording(false);
        } else if (event.error === 'network') {
          setVoiceError('Speech recognition network error. Please check your internet connection.');
          setIsRecording(false);
        } else if (event.error === 'no-speech') {
          // Subtle notice — don't stop recording if user is just thinking
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setVoiceError('Unable to activate microphone. Please try again.');
      setIsRecording(false);
    }
  }, [text, disabled]);

  // Stop recording and preserve transcribed text
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);
    setInterimTranscript('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Cancel recording and revert to previous text
  const cancelRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);
    setInterimTranscript('');
    setText(baseTextBeforeRecording.current);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="chat-input-container">
      {/* Voice Error Notification */}
      {voiceError && (
        <div className="voice-error-banner" role="alert">
          <AlertCircle size={15} />
          <span>{voiceError}</span>
          <button 
            type="button" 
            className="voice-error-dismiss" 
            onClick={() => setVoiceError('')}
            title="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <form 
        className={`chat-input-card ${isRecording ? 'voice-recording-active' : ''}`} 
        onSubmit={handleSubmit}
      >
        {/* Active Voice Recording Live Bar */}
        {isRecording && (
          <div className="voice-recording-strip">
            <div className="voice-status-group">
              <span className="voice-record-pulse-dot" />
              <span className="voice-status-text">Listening... Speak clearly</span>
              <div className="soundwave-bars" aria-hidden="true">
                <span className="soundwave-bar bar-1" />
                <span className="soundwave-bar bar-2" />
                <span className="soundwave-bar bar-3" />
                <span className="soundwave-bar bar-4" />
                <span className="soundwave-bar bar-5" />
              </div>
            </div>

            <div className="voice-recording-actions">
              <button
                type="button"
                className="voice-control-btn voice-done-btn"
                onClick={stopRecording}
                title="Done speaking (Keep text)"
              >
                <Square size={13} fill="currentColor" />
                <span>Done</span>
              </button>
              <button
                type="button"
                className="voice-control-btn voice-cancel-btn"
                onClick={cancelRecording}
                title="Cancel voice recording"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        <div className="textarea-wrapper">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isRecording 
                ? "Listening to your explanation... speak now." 
                : (placeholder || "Explain this concept in your own words... (Press Enter to send)")
            }
            disabled={disabled}
            className="chat-textarea-field"
          />

          {/* Real-time Interim Transcript Preview */}
          {isRecording && interimTranscript && (
            <div className="voice-interim-preview" aria-live="polite">
              <span className="interim-label">Hearing:</span>
              <span className="interim-text">"{interimTranscript}"</span>
            </div>
          )}
        </div>

        <div className="input-actions-bar">
          <span className="input-hint-text">
            <span>Enter ↵</span> to send • <span>Shift + Enter</span> for new line
          </span>

          <div className="input-button-cluster">
            {/* Voice Input Microphone Button */}
            <button
              type="button"
              onClick={toggleRecording}
              disabled={disabled || !isSpeechSupported}
              className={`voice-mic-btn ${isRecording ? 'recording' : ''}`}
              title={
                !isSpeechSupported
                  ? 'Voice input is not supported in this browser'
                  : isRecording
                  ? 'Stop voice recording'
                  : 'Speak your explanation (Voice Input)'
              }
              aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
            >
              {isRecording ? (
                <>
                  <Square size={15} fill="currentColor" />
                  <span className="voice-btn-label">Stop</span>
                </>
              ) : (
                <>
                  <Mic size={16} />
                  <span className="voice-btn-label">Voice</span>
                </>
              )}
            </button>

            {/* Send Button */}
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
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
