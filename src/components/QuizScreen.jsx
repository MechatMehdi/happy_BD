import React, { useState, useEffect, useCallback } from 'react';
import PixelKitty from './PixelKitty.jsx';
import SpeechBubble from './SpeechBubble.jsx';
import { questions, kittyMessages } from '../data/questions';
import useSound from '../hooks/useSound';

function QuizScreen({ onComplete }) {
  const { playCorrect, playWrong, playWaiting } = useSound();
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [kittyState, setKittyState] = useState('idle');
  const [message, setMessage] = useState("Let's test how well you know him iam just a paid actor");
  const [showNext, setShowNext] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  // Waiting sound effect
  useEffect(() => {
    if (selected === null) {
      const interval = setInterval(() => {
        playWaiting();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [selected, playWaiting]);

  const q = questions[current];

  const pick = useCallback((idx) => {
    if (selected !== null) return;
    setSelected(idx);
    setAnimKey(k => k + 1);

    if (idx === -1) {
      // Don't know
      const msg = kittyMessages.dontKnow[Math.floor(Math.random() * kittyMessages.dontKnow.length)];
      setKittyState('disappointed');
      setMessage(msg);
      playWrong();
    } else if (idx === q.correct) {
      const msg = kittyMessages.correct[Math.floor(Math.random() * kittyMessages.correct.length)];
      setKittyState('happy');
      setMessage(msg);
      setScore(s => s + 1);
      playCorrect();
    } else {
      const msg = kittyMessages.wrong[Math.floor(Math.random() * kittyMessages.wrong.length)];
      setKittyState('sad');
      setMessage(msg);
      playWrong();
    }
    setShowNext(true);
  }, [selected, q]);

  const next = () => {
    if (current + 1 >= questions.length) {
      onComplete(score);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setKittyState('idle');
      setMessage("Next question! Are you ready?, pls get it right or he will starve me");
      setShowNext(false);
    }
  };

  const progress = ((current) / questions.length) * 100;

  const optionStyle = (idx) => {
    let bg = 'var(--bg2)';
    let border = 'var(--purple)';
    let color = 'var(--text)';

    if (selected !== null) {
      if (idx === q.correct) {
        bg = '#2a5e3a'; border = '#69f0ae'; color = '#69f0ae';
      } else if (idx === selected && idx !== q.correct) {
        bg = '#5e2a2a'; border = '#ff5252'; color = '#ff5252';
      } else {
        bg = 'var(--bg2)'; border = '#444'; color = '#888';
      }
    }

    return {
      fontFamily: 'var(--pixel)',
      fontSize: '8px',
      padding: '10px 14px',
      background: bg,
      border: `2px solid ${border}`,
      borderRadius: 4,
      color,
      cursor: selected !== null ? 'default' : 'pointer',
      textAlign: 'left',
      lineHeight: 1.6,
      transition: 'all 0.2s',
      boxShadow: selected === null ? '2px 2px 0 var(--shadow)' : 'none',
      transform: selected === null ? 'none' : 'none',
      position: 'relative',
      zIndex: 1,
    };
  };

  return (
    <div className="screen" style={{ padding: '16px', gap: 12, maxWidth: 480, margin: '0 auto', width: '100%', position: 'relative' }}>
      {/* Header */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 8, color: 'var(--pink-light)' }}>Question {current + 1}/{questions.length}</span>
          <span style={{ fontSize: 8, color: 'var(--gold)' }}>Score: {score} ⭐</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Kitty + Bubble */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <SpeechBubble message={message} style={{ marginBottom: 10, fontSize: 8, maxWidth: 200 }} />
        <div key={animKey}>
          <PixelKitty state={kittyState} size={140} animate={false} />
        </div>
      </div>

      {/* Question */}
      <div className="pixel-box" style={{ padding: '14px 16px', width: '100%', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '9px', lineHeight: 1.8, textAlign: 'center', color: 'var(--pink-light)' }}>
          {q.text}
        </p>
      </div>

      {/* Options */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            style={optionStyle(idx)}
            onClick={() => pick(idx)}
          >
            <span style={{ color: 'var(--pink)', marginRight: 8 }}>
              {['A', 'B', 'C', 'D'][idx]}.
            </span>
            {opt}
          </button>
        ))}
        <button
          style={{
            ...optionStyle(-1),
            background: selected === -1 ? '#3a2a5e' : '#1a0a2e',
            border: `2px dashed ${selected !== null ? '#444' : 'var(--purple)'}`,
            color: selected !== null && selected !== -1 ? '#555' : 'var(--purple)',
          }}
          onClick={() => pick(-1)}
        >
           I don't know..."i hate you"
        </button>
      </div>

      {/* Next button */}
      {showNext && (
        <button
          className="pixel-btn pixel-btn-primary anim-popIn"
          onClick={next}
          style={{ marginTop: 4, position: 'relative', zIndex: 1 }}
        >
          {current + 1 >= questions.length ? 'See Results ✨' : 'Next Question →'}
        </button>
      )}
    </div>
  );
}

export default QuizScreen;
