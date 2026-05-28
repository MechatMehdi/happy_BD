import React from 'react';

function SpeechBubble({ message, style = {} }) {
  return (
    <div style={{
      position: 'relative',
      background: 'white',
      border: '3px solid #2d1b4e',
      borderRadius: '12px',
      padding: '12px 16px',
      maxWidth: 260,
      minWidth: 160,
      boxShadow: '3px 3px 0 #2d1b4e',
      animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      ...style,
    }}>
      <p style={{
        fontFamily: 'var(--pixel)',
        fontSize: '9px',
        color: '#2d1b4e',
        lineHeight: '1.8',
        textAlign: 'center',
      }}>
        {message}
      </p>
      {/* Tail pointing down-left */}
      <div style={{
        position: 'absolute',
        bottom: -16,
        left: 30,
        width: 0,
        height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: '16px solid white',
        filter: 'drop-shadow(1px 3px 0px #2d1b4e)',
      }} />
    </div>
  );
}

export default SpeechBubble;
