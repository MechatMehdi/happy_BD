import React, { useEffect, useRef, useState, useCallback } from 'react';
import useSound from '../hooks/useSound';

const W = 340;
const H = 420;
const GRAVITY = 0.28;
const JUMP = -6;
const PIPE_GAP = 135;
const PIPE_W = 40;
const PIPE_SPEED = 1.8;
const WIN_PIPES = 8;

function FlappyHeart({ onWin, onFail }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const animRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const startedRef = useRef(false);
  const doneRef = useRef(false);

  const { playJump, playCorrect, playWrong } = useSound();
  const jump = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    if (!startedRef.current) {
      startedRef.current = true;
      setStarted(true);
      s.running = true;
    }
    s.bird.vy = JUMP;
    playJump();
  }, [playJump]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    stateRef.current = {
      bird: { x: 80, y: H / 2, vy: 0, rotation: 0 },
      pipes: [],
      passed: 0,
      running: false,
      pipeTimer: 0,
      particles: [],
    };

    const onKey = (e) => {
      if (e.code === 'Space' || e.key === 'ArrowUp') { e.preventDefault(); jump(); }
    };
    const handleTouch = (e) => { e.preventDefault(); jump(); };

    window.addEventListener('keydown', onKey);
    canvas.addEventListener('click', jump);
    canvas.addEventListener('touchstart', handleTouch, { passive: false });

    const drawHeart = (ctx, x, y, size, color, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = color;
      const s = size / 2;
      ctx.beginPath();
      ctx.moveTo(x, y + s);
      ctx.bezierCurveTo(x + s, y - s / 2, x + s * 2, y + s / 2, x, y + s * 2);
      ctx.bezierCurveTo(x - s * 2, y + s / 2, x - s, y - s / 2, x, y + s);
      ctx.fill();
      ctx.restore();
    };

    const spawnPipe = () => {
      const top = 60 + Math.random() * (H - PIPE_GAP - 120);
      stateRef.current.pipes.push({
        x: W + 10,
        topH: top,
        bottomY: top + PIPE_GAP,
        scored: false,
      });
    };

    const loop = () => {
      const s = stateRef.current;
      ctx.clearRect(0, 0, W, H);

      // BG
      ctx.fillStyle = '#1a0a2e';
      ctx.fillRect(0, 0, W, H);

      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for (let i = 0; i < 30; i++) {
        const sx = (i * 37 + Date.now() * 0.01) % W;
        const sy = (i * 53) % H;
        ctx.fillRect(sx, sy, 1, 1);
      }

      if (s.running) {
        // Gravity
        s.bird.vy += GRAVITY;
        s.bird.y += s.bird.vy;
        s.bird.rotation = Math.min(Math.max(s.bird.vy * 3, -30), 60);

        // Pipes
        s.pipeTimer++;
        if (s.pipeTimer % 90 === 0) spawnPipe();

        s.pipes.forEach(p => {
          p.x -= PIPE_SPEED;

          // Score
          if (!p.scored && p.x + PIPE_W < s.bird.x) {
            p.scored = true;
            s.passed++;
            playCorrect();
            // Particles
            for (let i = 0; i < 8; i++) {
              s.particles.push({
                x: s.bird.x, y: s.bird.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 30, color: '#ff6b9d', size: 8,
              });
            }
          }
        });

        s.pipes = s.pipes.filter(p => p.x > -PIPE_W - 10);

        // Particles
        s.particles.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.life--;
        });
        s.particles = s.particles.filter(p => p.life > 0);
      } else {
        // Gentle bob
        s.bird.y = H / 2 + Math.sin(Date.now() * 0.003) * 8;
      }

      // Draw pipes
      s.pipes.forEach(p => {
        // Top pipe
        ctx.fillStyle = '#7e57c2';
        ctx.strokeStyle = '#b39ddb';
        ctx.lineWidth = 2;
        ctx.fillRect(p.x, 0, PIPE_W, p.topH);
        ctx.strokeRect(p.x, 0, PIPE_W, p.topH);
        // Hearts decoration on pipe
        drawHeart(ctx, p.x + PIPE_W / 2, p.topH - 25, 12, '#ff6b9d', 0.6);

        // Bottom pipe
        ctx.fillRect(p.x, p.bottomY, PIPE_W, H - p.bottomY);
        ctx.strokeRect(p.x, p.bottomY, PIPE_W, H - p.bottomY);
        drawHeart(ctx, p.x + PIPE_W / 2, p.bottomY + 10, 12, '#ff6b9d', 0.6);

        // Collision check
        if (!doneRef.current && s.running) {
          const bx = s.bird.x, by = s.bird.y;
          if (
            bx + 12 > p.x && bx - 12 < p.x + PIPE_W &&
            (by - 12 < p.topH || by + 12 > p.bottomY)
          ) {
            doneRef.current = true;
            s.running = false;
            playWrong();
            setTimeout(() => { setGameOver(true); onFail(); }, 400);
          }
        }
      });

      // Floor/ceiling
      if (s.running && !doneRef.current) {
        if (s.bird.y < 10 || s.bird.y > H - 10) {
          doneRef.current = true;
          s.running = false;
          playWrong();
          setTimeout(() => { setGameOver(true); onFail(); }, 400);
        }
      }

      // Win check
      if (s.passed >= WIN_PIPES && !doneRef.current) {
        doneRef.current = true;
        setTimeout(onWin, 400);
      }

      // Particles
      s.particles.forEach(p => {
        drawHeart(ctx, p.x, p.y, p.size, p.color, p.life / 30);
      });

      // Draw bird (heart)
      ctx.save();
      ctx.translate(s.bird.x, s.bird.y);
      ctx.rotate((s.bird.rotation * Math.PI) / 180);
      drawHeart(ctx, 0, -14, 22, '#ff6b9d');
      // Eyes on heart
      ctx.fillStyle = 'white';
      ctx.fillRect(-4, -10, 4, 4);
      ctx.fillRect(2, -10, 4, 4);
      ctx.fillStyle = '#2d1b4e';
      ctx.fillRect(-3, -9, 2, 2);
      ctx.fillRect(3, -9, 2, 2);
      ctx.restore();

      // HUD
      ctx.fillStyle = '#ffd54f';
      ctx.font = '10px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText(`${s.passed}/8`, W / 2, 30);
      ctx.textAlign = 'left';

      if (!startedRef.current) {
        ctx.fillStyle = 'rgba(255,107,157,0.9)';
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('CLICK or SPACE', W / 2, H - 60);
        ctx.fillText('to start flying!', W / 2, H - 44);
        ctx.textAlign = 'left';
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('click', jump);
      canvas.removeEventListener('touchstart', handleTouch);
    };
  }, [jump]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 16 }}>
      <div style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: 'var(--pink)' }}>
        Flappy Love 💘
      </div>
      <div style={{ fontFamily: 'var(--pixel)', fontSize: 7, color: 'var(--purple)', textAlign: 'center' }}>
        Click / Space / Tap to flap · Pass 8 pillars!
      </div>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          border: '3px solid var(--purple)',
          borderRadius: 8,
          boxShadow: '0 0 20px rgba(179,157,219,0.3)',
          cursor: 'pointer',
          touchAction: 'none',
          maxWidth: '100%',
        }}
      />
    </div>
  );
}

export default FlappyHeart;
