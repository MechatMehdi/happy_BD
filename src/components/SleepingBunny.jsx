import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import bunnySleeping from '../assets/bunny_sleeping.png';
import bunnyAngry from '../assets/Bunny_angry.png';
import bunnyHappy from '../assets/Bunny_happy.png';
import SpeechBubble from './SpeechBubble';

export default function SleepingBunny({ isEnd }) {
  const [annoyLevel, setAnnoyLevel] = useState(0);

  const handleClick = () => {
    if (annoyLevel < 5) {
      setAnnoyLevel(l => l + 1);
    } else if (annoyLevel === 5) {
      // 6th touch: close the tab
      window.close();
      setAnnoyLevel(6);
    }
  };

  const getMessage = () => {
    if (isEnd && annoyLevel === 0) return "yaay i wasn't touched *yawn";
    switch (annoyLevel) {
      case 0: return null;
      case 1: return "...";
      case 2: return "can you stop?";
      case 3: return "im trying to sleep here";
      case 4: return "SERIOUSLY?!";
      case 5: return "i dare you to touch me one more time";
      case 6: return "BYE!";
      default: return null;
    }
  };

  const size = 100;

  const content = (
    <div 
      style={{
        position: 'fixed',
        bottom: -15,
        left: 15,
        width: size,
        height: size,
        zIndex: 9999,
        cursor: 'pointer'
      }}
      onClick={handleClick}
    >
      {/* Messages or Zzz — floats above, no pointer events */}
      <div style={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        whiteSpace: 'normal',
        width: 160,
        marginBottom: 6
      }}>
        {annoyLevel === 0 && !isEnd ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontFamily: 'var(--pixel)', fontSize: 10, color: 'var(--pink)', animation: 'float 2s infinite ease-in-out', opacity: 0.8 }}>Z</span>
            <span style={{ fontFamily: 'var(--pixel)', fontSize: 14, color: 'var(--pink)', animation: 'float 2.5s infinite ease-in-out 0.5s', opacity: 0.9, marginLeft: 12 }}>Z</span>
            <span style={{ fontFamily: 'var(--pixel)', fontSize: 18, color: 'var(--pink)', animation: 'float 3s infinite ease-in-out 1s', marginLeft: 24 }}>Z</span>
          </div>
        ) : (
          <div style={{ animation: 'popIn 0.3s ease-out' }}>
            <SpeechBubble message={getMessage()} style={{ fontSize: 8, padding: '6px 10px', textAlign: 'center' }} />
          </div>
        )}
      </div>

      {/* Bunny image — fills the container, pointer-events off so container owns the click */}
      <img 
        src={isEnd && annoyLevel === 0 ? bunnyHappy : (annoyLevel >= 5 ? bunnyAngry : bunnySleeping)} 
        alt="Sleeping Bunny"
        style={{ 
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          imageRendering: 'auto',
          filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.3))',
          animation: annoyLevel > 0 && annoyLevel < 5 ? 'bounce 0.4s' : 'none',
          pointerEvents: 'none',
          display: 'block'
        }} 
      />
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
}

