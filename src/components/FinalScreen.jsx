import React, { useState, useEffect } from 'react';
import deeHappy from '../assets/dee_happy.png';
import Confetti from './Confetti.jsx';

function FinalScreen() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    setShowConfetti(true);
    // Increased heart count for "lots of flying hearts"
    const h = Array.from({ length: 45 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      size: 10 + Math.random() * 20,
      duration: 4 + Math.random() * 6,
      color: ['#ff6b9d', '#ffb3d1', '#ffd54f', '#ff8a65'][i % 4], // Added warmer orange
    }));
    setHearts(h);
  }, []);

  return (
    <div className="screen" style={{
      gap: 0,
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at center, #3e2723 0%, #1a0a2e 100%)', // Warmer dark brown/purple
    }}>
      <Confetti active={showConfetti} />

      {/* Ambient floating hearts */}
      {hearts.map(h => (
        <div key={h.id} style={{
          position: 'absolute',
          left: `${h.x}%`,
          bottom: '-10%',
          fontSize: h.size,
          color: h.color,
          opacity: 0.4,
          animation: `float ${h.duration}s ease-in-out ${h.delay}s infinite`,
          pointerEvents: 'none',
          textShadow: `0 0 15px ${h.color}`,
          zIndex: 0,
        }}>♥</div>
      ))}

      <style>
        {`
          @keyframes happyJump {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-30px) scale(1.05); }
          }
          .heart-frame {
            border: 4px double var(--pink);
            background: rgba(45, 27, 78, 0.85);
            padding: 24px;
            border-radius: 8px;
            position: relative;
            box-shadow: 0 0 20px rgba(255,107,157,0.4);
            max-width: 320px;
            margin-top: 20px;
          }
          .tiny-heart {
            position: absolute;
            font-size: 10px;
            color: var(--pink);
            animation: twinkle 1.5s infinite;
          }
        `}
      </style>

      {/* Central content */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: 24, zIndex: 1, textAlign: 'center', gap: 10
      }}>
        
        {/* Jumping Dee */}
        <div style={{ 
          filter: 'drop-shadow(0 0 20px rgba(255,107,157,0.5))',
          marginBottom: 10
        }}>
          <img 
            src={deeHappy} 
            alt="Happy Dee" 
            style={{ width: 220, height: 'auto', imageRendering: 'auto' }} 
          />
        </div>

        {/* Message Frame */}
        <div className="heart-frame anim-fadeInUp">
          {/* Decorative Tiny Hearts */}
          <span className="tiny-heart" style={{ top: -10, left: -10 }}>♥</span>
          <span className="tiny-heart" style={{ top: -10, right: -10 }}>♥</span>
          <span className="tiny-heart" style={{ bottom: -10, left: -10 }}>♥</span>
          <span className="tiny-heart" style={{ bottom: -10, right: -10 }}>♥</span>
          <span className="tiny-heart" style={{ top: '50%', left: -15 }}>♥</span>
          <span className="tiny-heart" style={{ top: '50%', right: -15 }}>♥</span>

          <p style={{
            fontFamily: 'var(--pixel)',
            fontSize: '9px',
            color: 'var(--cream)',
            lineHeight: 1.8,
            textAlign: 'left',
          }}>
            Happy birthday, my dear<br/><br/>
            Inchallah you’ll have a long, beautiful life filled with happiness, and all your dreams will come true. And of course… with me, bayna<br/><br/>
            It’s already the third birthday we’ve celebrated together, time really does fly. Inchallah we’ll share many, many more birthdays side by side.<br/><br/>
            You are my whole world, Tasnime. I love you so much 🤍
          </p>
        </div>

        <a 
          href="https://drive.google.com/drive/folders/1K1xmBVkF6AQJ7s3q2iuXbqLCgRdyRK3x" 
          target="_blank" 
          rel="noopener noreferrer"
          className="pixel-btn pixel-btn-primary anim-bounce"
          style={{
            marginTop: 20,
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          Claim Gift 🎁
        </a>

        {/* Warm Glow Background Overlay */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 107, 157, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: -1
        }} />
      </div>
    </div>
  );
}

export default FinalScreen;
