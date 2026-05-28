import React, { useState, useEffect, useRef, useCallback } from 'react';
import useSound from '../hooks/useSound';

const TARGET = 27;
const TIME_LIMIT = 5;

function SpamClick({ onWin, onFail }) {
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [hearts, setHearts] = useState([]);
  const { playClick, playWin, playFail, playWaiting } = useSound();
  const [btnScale, setBtnScale] = useState(1);
  const [isShaking, setIsShaking] = useState(false);
  const timerRef = useRef(null);
  const countRef = useRef(0);
  const doneRef = useRef(false);
  const nextId = useRef(0);

  const startedRef = useRef(false);
  const startTimeRef = useRef(0);

  const startGame = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setStarted(true);
    startTimeRef.current = Date.now();
    
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, TIME_LIMIT - elapsed);
      
      setTimeLeft(Math.ceil(remaining));

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        if (!doneRef.current) {
          doneRef.current = true;
          setDone(true);
          setTimeout(() => {
            if (countRef.current >= TARGET) {
              playWin();
              onWin();
            } else {
              playFail();
              onFail();
            }
          }, 600);
        }
      } else if (remaining <= 3) {
          // Play waiting sound if not already playing or just pulse it
          playWaiting();
      }
    }, 100); // Check more frequently for accuracy
  }, [playWin, onWin, playFail, onFail, playWaiting]);

  const handleClick = useCallback(() => {
    if (done) return;
    if (!startedRef.current) startGame();

    const newCount = countRef.current + 1;
    countRef.current = newCount;
    setCount(newCount);
    setBtnScale(0.9);
    setIsShaking(true);
    setTimeout(() => {
      setBtnScale(1);
      setIsShaking(false);
    }, 80);

    // Floating heart
    const id = nextId.current++;
    const x = 30 + Math.random() * 40;
    const y = -(40 + Math.random() * 30);
    setHearts(h => [...h, { id, x, y }]);
    setTimeout(() => setHearts(h => h.filter(hh => hh.id !== id)), 800);

    if (newCount >= TARGET && !doneRef.current) {
      doneRef.current = true;
      clearInterval(timerRef.current);
      setDone(true);
      playWin();
      setTimeout(onWin, 400);
    }
    playClick();
  }, [done, started, startGame, playClick, playWin]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); handleClick(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [handleClick]);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const progress = Math.min(count / TARGET, 1);
  const timeProgress = timeLeft / TIME_LIMIT;
  const timeColor = timeLeft <= 2 ? '#ff5252' : timeLeft <= 3 ? '#ffd54f' : '#69f0ae';

  return (
    <div className={isShaking ? 'anim-screenShake' : ''} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 20, padding: 24, maxWidth: 340, margin: '0 auto',
    }}>
      <div style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: 'var(--pink)' }}>
        Love Spam 💝
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 24, width: '100%', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontFamily: 'var(--pixel)', color: 'var(--pink)', animation: 'heartbeat 0.4s ease-in-out infinite' }}>
            {count}
          </div>
          <div style={{ fontSize: 7, color: 'var(--pink-light)' }}>clicks</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontFamily: 'var(--pixel)', color: timeColor }}>
            {timeLeft}
          </div>
          <div style={{ fontSize: 7, color: 'var(--pink-light)' }}>seconds</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontFamily: 'var(--pixel)', color: 'var(--gold)' }}>
            {TARGET}
          </div>
          <div style={{ fontSize: 7, color: 'var(--pink-light)' }}>goal</div>
        </div>
      </div>

      {/* Progress bar - count */}
      <div style={{ width: '100%' }}>
        <div style={{ fontSize: 7, color: 'var(--pink-light)', marginBottom: 4, fontFamily: 'var(--pixel)' }}>
          Love meter
        </div>
        <div className="progress-bar" style={{ height: 16 }}>
          <div className="progress-fill" style={{
            width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, #ff6b9d, #ffd54f)',
          }} />
        </div>
      </div>

      {/* Timer bar */}
      {started && (
        <div style={{ width: '100%' }}>
          <div style={{ fontSize: 7, color: 'var(--pink-light)', marginBottom: 4, fontFamily: 'var(--pixel)' }}>
            Time left
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <div style={{
              height: '100%',
              width: `${timeProgress * 100}%`,
              background: timeColor,
              transition: 'width 0.1s linear, background 0.3s',
            }} />
          </div>
        </div>
      )}

      {/* Main button */}
      <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
        {/* Floating hearts */}
        {hearts.map(h => (
          <div key={h.id} style={{
            position: 'absolute',
            left: `${h.x}%`,
            top: h.y,
            fontSize: 16,
            animation: 'fadeInUp 0.8s ease-out forwards',
            pointerEvents: 'none',
            color: '#ff6b9d',
          }}>
            ♥
          </div>
        ))}

        <button
          onClick={handleClick}
          disabled={done}
          style={{
            fontFamily: 'var(--pixel)',
            fontSize: 11,
            padding: '18px 28px',
            background: done ? '#444' : 'linear-gradient(135deg, var(--pink), #c2185b)',
            border: '3px solid',
            borderColor: done ? '#666' : '#ff6b9d',
            borderRadius: 8,
            color: 'white',
            cursor: done ? 'default' : 'pointer',
            transform: `scale(${btnScale})`,
            transition: 'transform 0.08s',
            boxShadow: done ? 'none' : '0 0 20px rgba(255,107,157,0.5), 3px 3px 0 #2d1b4e',
            letterSpacing: 1,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'manipulation',
          }}
        >
          {done ? (count >= TARGET ? '💖 Done!' : '💔 Time\'s up') : 'I love you ❤️'}
        </button>
      </div>

      {!started && (
        <div style={{
          fontFamily: 'var(--pixel)', fontSize: 8,
          color: 'var(--purple)', textAlign: 'center', lineHeight: 1.8,
          animation: 'twinkle 1.5s ease-in-out infinite',
        }}>
          Click the button {TARGET} times<br />in {TIME_LIMIT} seconds!
        </div>
      )}

      {done && (
        <div style={{
          fontFamily: 'var(--pixel)', fontSize: 9,
          color: count >= TARGET ? 'var(--gold)' : '#ff5252',
          animation: 'popIn 0.4s ease-out',
          textAlign: 'center',
        }}>
          {count >= TARGET ? `${count} times! 💖` : `Only ${count}... 💔`}
        </div>
      )}
    </div>
  );
}

export default SpamClick;
