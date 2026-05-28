import React, { useState } from 'react';
import PixelKitty from './PixelKitty.jsx';
import SpeechBubble from './SpeechBubble.jsx';
import Confetti from './Confetti.jsx';
import HeartCollector from '../games/HeartCollector';
import FlappyHeart from '../games/FlappyHeart';
import HeartBasketball from '../games/HeartBasketball';
import SpamClick from '../games/SpamClick';

const GAMES = [
  {
    id: 1,
    title: 'Heart Collector ',
    desc: 'Catch falling hearts! Get 70% or more.',
    component: HeartCollector,
    kittyMsg: "Catch all the hearts he's sending you! ",
  },
  {
    id: 2,
    title: 'Flappy Love ',
    desc: 'Fly through obstacles! Pass 8 pillars.',
    component: FlappyHeart,
    kittyMsg: "Fly high for me! Don't give up! ",
    failMsg: "that's just like 9/11",
  },
  {
    id: 3,
    title: 'Heart Basketball ',
    desc: 'Shoot hearts into the basket! Score 3/5.',
    component: HeartBasketball,
    kittyMsg: "Aim for my heart~ literally! ",
  },
  {
    id: 4,
    title: 'Love Spam ',
    desc: 'Click "I love you" 25 times in 5 seconds!',
    component: SpamClick,
    kittyMsg: "Show me how much you love me!! ",
  },
];

const SkipButton = ({ onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: '7px',
        fontFamily: 'var(--pixel)',
        background: 'transparent',
        border: 'none',
        color: 'var(--pink-light)',
        textDecoration: 'underline',
        cursor: 'pointer',
        marginTop: '16px',
        opacity: hovered ? 1 : 0.6,
        transition: 'opacity 0.2s',
        zIndex: 10,
      }}
    >
      iam a loser and i don't deserve love
    </button>
  );
};

function GameHub({ onComplete }) {
  const [gameIdx, setGameIdx] = useState(() => {
    const saved = localStorage.getItem('titi_game_idx');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [phase, setPhase] = useState('intro'); // intro | playing | success | fail | cheater
  const [confetti, setConfetti] = useState(false);

  const currentGame = GAMES[gameIdx];
  const GameComponent = currentGame?.component;

  const handleWin = () => {
    setConfetti(true);
    setPhase('success');
    setTimeout(() => setConfetti(false), 3000);
  };

  const handleFail = () => setPhase('fail');

  const handleNext = () => {
    if (gameIdx + 1 >= GAMES.length) {
      localStorage.removeItem('titi_game_idx');
      onComplete();
    } else {
      const nextIdx = gameIdx + 1;
      setGameIdx(nextIdx);
      localStorage.setItem('titi_game_idx', nextIdx.toString());
      setPhase('intro');
    }
  };

  const handleRetry = () => setPhase('playing');

  if (!currentGame) return null;

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <Confetti active={confetti} />

      {/* Game progress dots */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
        zIndex: 10,
      }}>
        {GAMES.map((g, i) => (
          <div key={g.id} style={{
            width: 10, height: 10,
            borderRadius: '50%',
            background: i < gameIdx ? 'var(--gold)' : i === gameIdx ? 'var(--pink)' : '#444',
            border: '2px solid',
            borderColor: i <= gameIdx ? 'var(--pink)' : '#666',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      {phase === 'intro' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 16, padding: 20, animation: 'fadeIn 0.4s ease-out',
        }}>
          <div style={{
            fontSize: 9, color: 'var(--pink-light)',
            marginTop: 24,
          }}>
            Mini-Game {gameIdx + 1} of {GAMES.length}
          </div>
          <div style={{ fontSize: 20, textAlign: 'center', color: 'var(--pink)', fontFamily: 'var(--pixel)', lineHeight: 1.6 }}>
            {currentGame.title}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <SpeechBubble message={currentGame.kittyMsg} />
            <PixelKitty state="idle" size={140} />
          </div>
          <div className="pixel-box" style={{ padding: '10px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 8, color: 'var(--cream)', lineHeight: 1.8 }}>{currentGame.desc}</p>
          </div>
          <button className="pixel-btn pixel-btn-primary anim-bounce" onClick={() => setPhase('playing')}>
            ▶ Play!
          </button>
          <SkipButton onClick={() => setPhase('cheater')} />
        </div>
      )}

      {phase === 'playing' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <GameComponent onWin={handleWin} onFail={handleFail} />
          <SkipButton onClick={() => setPhase('cheater')} />
        </div>
      )}

      {phase === 'success' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 16, padding: 20, animation: 'popIn 0.5s ease-out',
        }}>
          <div style={{ fontSize: 40, animation: 'heartbeat 0.5s ease-in-out 4' }}>🎉</div>
          <div style={{ fontSize: 12, color: 'var(--gold)', fontFamily: 'var(--pixel)', textAlign: 'center', lineHeight: 1.8 }}>
            You did it!!
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <SpeechBubble message="Amazing!! I'm so proud of you!, try to be like that in overwatch " />
            <PixelKitty state="happy" size={140} />
          </div>
          <button
            className="pixel-btn pixel-btn-primary anim-bounce"
            onClick={handleNext}
          >
            {gameIdx + 1 >= GAMES.length ? 'Finish ❤️' : 'Next Game →'}
          </button>
        </div>
      )}

      {phase === 'fail' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 16, padding: 20, animation: 'fadeIn 0.4s ease-out',
        }}>
          <div style={{ fontSize: 10, color: 'var(--pink-light)', fontFamily: 'var(--pixel)', textAlign: 'center', lineHeight: 1.8 }}>
            So close!
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <SpeechBubble message={currentGame.failMsg || "You can do it! Try again, I believe in you titooosh! "} />
            <PixelKitty state="sad" size={140} />
          </div>
          <button className="pixel-btn pixel-btn-primary" onClick={handleRetry}>
            Try Again
          </button>
          <SkipButton onClick={() => setPhase('cheater')} />
        </div>
      )}

      {phase === 'cheater' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 16, padding: 20, animation: 'fadeIn 0.4s ease-out',
        }}>
          <div style={{ fontSize: 12, color: 'var(--pink-light)', fontFamily: 'var(--pixel)', textAlign: 'center', lineHeight: 1.8 }}>
            ...
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <SpeechBubble message="dirty cheater you don't deserve love" />
            <PixelKitty state="disappointed" size={140} />
          </div>
          <button
            className="pixel-btn pixel-btn-primary"
            onClick={() => {
              localStorage.removeItem('titi_game_idx');
              onComplete();
            }}
          >
            Finish ❤️
          </button>
        </div>
      )}
    </div>
  );
}

export default GameHub;
