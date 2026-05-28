import React, { useState, useEffect } from 'react';
import deeImg from '../assets/dee.png';
import kittyImg from '../assets/Kitty_happy.png';
import SpeechBubble from './SpeechBubble.jsx';
import useSound from '../hooks/useSound';

function StartScreen({ onStart }) {
  const { playClick } = useSound();
  const [visible, setVisible] = useState(false);
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    // Floating hearts background
    const h = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      size: 12 + Math.random() * 20,
      duration: 3 + Math.random() * 4,
    }));
    setHearts(h);
  }, []);

  return (
    <div className="screen" style={{ gap: 20 }}>
      {/* Floating hearts */}
      {hearts.map(h => (
        <div key={h.id} style={{
          position: 'absolute',
          left: `${h.x}%`,
          bottom: '-10%',
          fontSize: h.size,
          opacity: 0.4,
          animation: `float ${h.duration}s ease-in-out ${h.delay}s infinite`,
          pointerEvents: 'none',
          zIndex: 0,
        }}>♥</div>
      ))}

      <div style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1200px',
        padding: '20px'
      }}>
        {/* Title Moved Up */}
        <div style={{
          textAlign: 'center',
          marginBottom: 20, // Reduced from 40
          marginTop: -60, // Move it up even more
          animation: 'fadeInUp 0.6s ease-out',
        }}>
          <h1 style={{
            fontFamily: 'var(--pixel)',
            fontSize: 16, // Slightly smaller
            color: 'var(--pink)',
            lineHeight: 1.4,
          }}>
            I Made Something<br />
            <span style={{ color: 'var(--gold)' }}>For You</span> ❤️
          </h1>
        </div>

        {/* Characters Container */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: 5,
          marginBottom: 20, // Reduced from 30
          flexWrap: 'wrap',
          animation: 'fadeInUp 0.8s ease-out 0.2s both',
        }}>
          {/* Dee Character */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            <div style={{ animation: 'float 3s ease-in-out infinite' }}>
              <SpeechBubble
                message="happy birthday tito,i made this site for you there's alot of suprises waiting for you ,this will be your host kitty-chan"
                style={{ marginBottom: 10, maxWidth: 180 }} // Reduced margin and maxWidth
              />
            </div>
            <img src={deeImg} alt="Dee" style={{ width: 180, height: 'auto', imageRendering: 'auto' }} />
          </div>

          {/* Kitty Character */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            <div style={{ animation: 'float 3.5s ease-in-out infinite' }}>
              <SpeechBubble
                message="iam happy to meet you tasnime let's see if you can finish the game dee made"
                style={{ marginBottom: 10, maxWidth: 180 }} // Reduced margin and maxWidth
              />
            </div>
            <img src={kittyImg} alt="Kitty" style={{ width: 180, height: 'auto', imageRendering: 'auto' }} />
          </div>
        </div>

        {/* Start button + Warning */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10, // Reduced from 15
          animation: 'fadeInUp 0.8s ease-out 0.4s both',
        }}>
          <button
            className="pixel-btn pixel-btn-primary anim-bounce"
            onClick={() => { playClick(); onStart(); }}
            style={{ fontSize: 10, padding: '12px 24px' }} // Slightly smaller
          >
            ▶ Start ❤️
          </button>
          <p style={{
            fontSize: 7, // Slightly smaller
            color: 'var(--purple)',
            textAlign: 'center',
            opacity: 0.9,
            fontFamily: 'var(--pixel)',
            letterSpacing: '0.5px'
          }}>
            warning the games are kinda hard matejahlich 0_0
          </p>
        </div>
      </div>
    </div>
  );
}

export default StartScreen;
