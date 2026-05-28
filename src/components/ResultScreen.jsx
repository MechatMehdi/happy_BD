import React, { useState, useEffect } from 'react';
import PixelKitty from './PixelKitty.jsx';
import SpeechBubble from './SpeechBubble.jsx';
import Confetti from './Confetti.jsx';
import useSound from '../hooks/useSound';

function ResultScreen({ score, total = 10, onUnlock, onRetry }) {
  const { playClick, playCorrect, playWin, playFail } = useSound();
  const passed = score >= 8;
  const [animPhase, setAnimPhase] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (passed) {
      setTimeout(() => { setAnimPhase(1); playClick(); }, 400);
      setTimeout(() => { setAnimPhase(2); playCorrect(); }, 1200);
      setTimeout(() => { setAnimPhase(3); setShowConfetti(true); playWin(); }, 2000);
      setTimeout(() => setShowConfetti(false), 4000);
    } else {
      playFail();
    }
  }, [passed, playClick, playCorrect, playWin, playFail]);

  const stars = Math.round((score / total) * 5);

  return (
    <div className="screen" style={{ gap: 20, padding: 20 }}>
      <Confetti active={showConfetti} />

      {/* Score display */}
      <div style={{
        textAlign: 'center',
        animation: 'fadeInUp 0.5s ease-out',
      }}>
        <div style={{ fontSize: 9, color: 'var(--pink-light)', marginBottom: 8 }}>Quiz Complete!</div>
        <div style={{ fontSize: 28, color: 'var(--gold)', marginBottom: 8, animation: 'heartbeat 0.8s ease-in-out 3' }}>
          {score}/{total}
        </div>
        <div style={{ fontSize: 20 }}>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{
              color: i < stars ? 'var(--gold)' : '#444',
              animation: i < stars ? `popIn 0.3s ${i * 0.1}s both` : 'none',
            }}>★</span>
          ))}
        </div>
      </div>

      {/* Kitty */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <SpeechBubble message={
          passed
            ? "You know hum so well!! 💖 You unlocked something special~"
            : `Hmm... you got ${score}/10. You need 8 to unlock! Try again? 🥺`
        } />
        <PixelKitty state={passed ? 'happy' : 'sad'} size={150} />
      </div>

      {/* Unlock animation */}
      {passed && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          animation: 'fadeIn 0.5s ease-out',
        }}>
          {/* Locked box breaking open */}
          <div style={{
            fontSize: animPhase >= 2 ? 60 : 52,
            transition: 'font-size 0.3s',
            animation: animPhase >= 1 ? 'shake 0.4s ease-in-out' : 'none',
            filter: animPhase >= 2 ? 'drop-shadow(0 0 20px gold)' : 'none',
          }}>
            {animPhase < 2 ? '🔒' : animPhase === 2 ? '🔓' : '🎁'}
          </div>

          {animPhase >= 2 && (
            <div style={{
              fontSize: 9,
              color: 'var(--gold)',
              animation: 'fadeInUp 0.5s ease-out',
              textAlign: 'center',
            }}>
              ✨ Mini-games unlocked! ✨
            </div>
          )}

          {animPhase >= 3 && (
            <button
              className="pixel-btn pixel-btn-primary anim-bounce"
              onClick={() => { playClick(); onUnlock(); }}
            >
              Play Now! 🎮
            </button>
          )}
        </div>
      )}

      {!passed && (
        <button className="pixel-btn pixel-btn-secondary anim-fadeIn" onClick={() => { playClick(); onRetry(); }}>
          Try Again 🔄
        </button>
      )}
    </div>
  );
}

export default ResultScreen;
