import React, { useEffect, useRef, useState } from 'react';
import useSound from '../hooks/useSound';

const CANVAS_W = 340;
const CANVAS_H = 420;
const PLAYER_W = 50;
const PLAYER_H = 20;
const WIN_TARGET = 15;

function HeartCollector({ onWin, onFail }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const animRef = useRef(null);
  const [isDone, setIsDone] = useState(false);
  const { playCorrect, playWrong, playFail, playWin } = useSound();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    stateRef.current = {
      player: { x: CANVAS_W / 2 - PLAYER_W / 2, y: CANVAS_H - 40 },
      hearts: [],
      caught: 0,
      missed: 0,
      spawned: 0,
      keys: { left: false, right: false },
      spawnTimer: 0,
      speed: 2,
      gameEnded: false,
    };

    const state = stateRef.current;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') state.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') state.keys.right = true;
    };
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') state.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') state.keys.right = false;
    };

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
      state.player.x = Math.max(0, Math.min(CANVAS_W - PLAYER_W, x - PLAYER_W / 2));
    };

    const handleTouch = (e) => {
      e.preventDefault();
      onMouseMove(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', handleTouch, { passive: false });

    const spawnObject = () => {
      if (state.gameEnded) return;
      // 60% chance of bomb (6/10 ratio)
      const isObstacle = Math.random() < 0.6; 
      state.hearts.push({
        x: 20 + Math.random() * (CANVAS_W - 40),
        y: -20,
        vy: (state.speed + 1) + Math.random() * 2, // Increased speed
        size: isObstacle ? 20 : 18 + Math.random() * 10,
        color: isObstacle ? '#444' : ['#ff6b9d', '#ff8ab0', '#ffb3d1', '#c2185b', '#ff4081'][Math.floor(Math.random() * 5)],
        alive: true,
        isObstacle,
      });
      state.spawned++;
      if (state.speed < 8) state.speed += 0.1; // Faster acceleration
    };

    const drawHeart = (ctx, x, y, size, color, stroke = null) => {
      ctx.save();
      ctx.fillStyle = color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
      }
      ctx.beginPath();
      const s = size / 2;
      ctx.moveTo(x, y + s);
      ctx.bezierCurveTo(x + s, y - s / 2, x + s * 2, y + s / 2, x, y + s * 2);
      ctx.bezierCurveTo(x - s * 2, y + s / 2, x - s, y - s / 2, x, y + s);
      ctx.fill();
      if (stroke) ctx.stroke();
      ctx.restore();
    };

    const drawObstacle = (ctx, x, y, size) => {
      ctx.save();
      // Bomb with pink outline to confuse
      ctx.strokeStyle = '#ff6b9d';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(x, y + size/2, size/2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#ff6b9d';
      ctx.font = `${size * 0.8}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💣', x, y + size/2);
      ctx.restore();
    };

    const drawPlayer = (ctx, x, y) => {
      ctx.fillStyle = '#b39ddb';
      ctx.strokeStyle = '#7e57c2';
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, PLAYER_W, PLAYER_H, 8);
      else ctx.rect(x, y, PLAYER_W, PLAYER_H);
      ctx.fill();
      ctx.stroke();
      drawHeart(ctx, x + PLAYER_W / 2, y + 2, 10, '#ff6b9d');
    };

    const loop = () => {
      const s = stateRef.current;
      if (!s) return;
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      ctx.fillStyle = 'rgba(26, 10, 46, 0.95)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      ctx.fillStyle = 'rgba(180, 100, 200, 0.15)';
      for (let gx = 0; gx < CANVAS_W; gx += 20) {
        for (let gy = 0; gy < CANVAS_H; gy += 20) {
          ctx.fillRect(gx, gy, 2, 2);
        }
      }

      if (s.keys.left) s.player.x = Math.max(0, s.player.x - 7); // Slightly faster movement to compensate
      if (s.keys.right) s.player.x = Math.min(CANVAS_W - PLAYER_W, s.player.x + 7);

      s.spawnTimer++;
      if (s.spawnTimer % 25 === 0) spawnObject(); // Faster spawning

      s.hearts.forEach(h => {
        if (!h.alive) return;
        h.y += h.vy;

        if (
          h.y + h.size > s.player.y &&
          h.y < s.player.y + PLAYER_H &&
          h.x > s.player.x - h.size / 2 &&
          h.x < s.player.x + PLAYER_W + h.size / 2
        ) {
          h.alive = false;
          if (h.isObstacle) {
            // Instant failure
            s.gameEnded = true;
            playWrong();
            setTimeout(() => {
              cancelAnimationFrame(animRef.current);
              setIsDone(true);
              playFail();
              onFail();
            }, 300);
          } else {
            s.caught++;
            playCorrect();
            
            // Win check
            if (s.caught >= WIN_TARGET && !s.gameEnded) {
              s.gameEnded = true;
              setTimeout(() => {
                cancelAnimationFrame(animRef.current);
                setIsDone(true);
                playWin();
                onWin();
              }, 300);
            }
          }
        } else if (h.y > CANVAS_H) {
          h.alive = false;
          if (!h.isObstacle) s.missed++;
        }

        if (h.alive) {
          if (h.isObstacle) drawObstacle(ctx, h.x, h.y, h.size);
          else drawHeart(ctx, h.x, h.y, h.size, h.color);
        }
      });

      drawPlayer(ctx, s.player.x, s.player.y);

      // HUD
      ctx.fillStyle = '#ff6b9d';
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText(`Hearts: ${s.caught}/${WIN_TARGET}`, 10, 20);
      ctx.fillStyle = '#b39ddb';
      ctx.fillText(`Missed: ${s.missed}`, 10, 36);

      const prog = Math.min(s.caught / WIN_TARGET, 1);
      ctx.fillStyle = '#2d1b4e';
      ctx.fillRect(10, CANVAS_H - 18, CANVAS_W - 20, 8);
      ctx.fillStyle = prog >= 1 ? '#69f0ae' : '#ff6b9d';
      ctx.fillRect(10, CANVAS_H - 18, (CANVAS_W - 20) * prog, 8);

      if (!s.gameEnded) {
        animRef.current = requestAnimationFrame(loop);
      }
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', handleTouch);
    };
  }, [onWin, onFail, playCorrect, playWrong, playWin]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 16 }}>
      <div style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: 'var(--pink)' }}>
        Heart Collector 🌸
      </div>
      <div style={{ fontFamily: 'var(--pixel)', fontSize: 7, color: 'var(--purple)', textAlign: 'center' }}>
        Don't let the pink outlines trick you!<br/>Collect {WIN_TARGET} hearts to win.
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{
          border: '3px solid var(--pink)',
          borderRadius: 8,
          boxShadow: '0 0 20px rgba(255,107,157,0.3)',
          cursor: 'none',
          touchAction: 'none',
          maxWidth: '100%',
        }}
      />
    </div>
  );
}

export default HeartCollector;
