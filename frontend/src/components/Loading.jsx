import React from 'react';
import { Brain } from 'lucide-react';

const Loading = ({ message = "Thinking..." }) => {
  return (
    <div className="loading-indicator">
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        color: '#4f28d9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(79, 40, 217, 0.15)',
        marginBottom: '4px'
      }}>
        <Brain size={26} style={{ animation: 'livePulse 2s infinite ease-in-out' }} />
      </div>
      <div className="dots-container">
        <span className="dot dot-1"></span>
        <span className="dot dot-2"></span>
        <span className="dot dot-3"></span>
      </div>
      <span className="loading-message">{message}</span>
    </div>
  );
};

export default Loading;
