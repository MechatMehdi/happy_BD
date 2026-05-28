import React, { useEffect, useRef, useState } from 'react';
import useSound from '../hooks/useSound';

const W = 340;
const H = 420;
const HOOP_X = 260;
const HOOP_Y = 150;
const HOOP_R = 28;
const BALL_RADIUS = 12;
const MAX_SHOTS = 5;
const NEEDED_SCORE = 3;

function HeartBasketball({ onWin, onFail }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const animRef = useRef(null);
  const doneRef = useRef(false);
  const { playJump, playCorrect, playFail, playWrong } = useSound();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    stateRef.current = {
      ball: { x: 70, y: H - 80, vx: 0, vy: 0, flying: false },
      shots: 0,
      score: 0,
      power: 0,
      powerDir: 1,
      aiming: true,
      particles: [],
      missed: false,
      scored: false,
      settle: 0,
      defenderY: H / 2,
      defenderPhase: 0,
    };

    const state = stateRef.current;

    const drawHeart = (ctx, x, y, size, color, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;
      ctx.beginPath();
      // Centered heart drawing logic
      const s = size / 2;
      ctx.translate(x, y - s); // Adjust y to center it better
      ctx.moveTo(0, s / 2);
      ctx.bezierCurveTo(s / 2, -s / 4, s, s / 4, 0, s);
      ctx.bezierCurveTo(-s, s / 4, -s / 2, -s / 4, 0, s / 2);
      ctx.fill();
      ctx.restore();
    };

    const drawDefender = (ctx, x, y) => {
      ctx.save();
      ctx.strokeStyle = '#69f0ae';
      ctx.fillStyle = '#69f0ae';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#69f0ae';
      
      // Head
      ctx.beginPath();
      ctx.arc(x, y - 35, 8, 0, Math.PI * 2); // Smaller head
      ctx.fill();
      
      // Headband
      ctx.fillStyle = '#ff6b9d';
      ctx.fillRect(x - 8, y - 38, 16, 3);

      // Jersey
      ctx.fillStyle = '#69f0ae';
      ctx.fillRect(x - 8, y - 25, 16, 20);
      ctx.strokeStyle = '#2d1b4e';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 8, y - 25, 16, 20);
      
      // Number on Jersey
      ctx.fillStyle = '#2d1b4e';
      ctx.font = '8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('23', x, y - 10);

      // Arms (Up position)
      ctx.strokeStyle = '#69f0ae';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 20);
      ctx.lineTo(x - 18, y - 40);
      ctx.moveTo(x + 8, y - 20);
      ctx.lineTo(x + 18, y - 40);
      ctx.stroke();
      
      // Legs
      ctx.beginPath();
      ctx.moveTo(x - 4, y - 5);
      ctx.lineTo(x - 10, y + 10);
      ctx.moveTo(x + 4, y - 5);
      ctx.lineTo(x + 10, y + 10);
      ctx.stroke();
      
      ctx.restore();
    };

    const reset = () => {
      const s = stateRef.current;
      if (!s) return;
      s.ball = { x: 70, y: H - 80, vx: 0, vy: 0, flying: false };
      s.power = 0;
      s.powerDir = 1;
      s.aiming = true;
      s.missed = false;
      s.scored = false;
      s.settle = 0;
    };

    const shoot = () => {
      const s = stateRef.current;
      if (!s || !s.aiming || doneRef.current) return;
      s.aiming = false;

      const power = s.power;
      const dx = HOOP_X - s.ball.x;
      const dy = HOOP_Y - s.ball.y;
      
      // Calculate physics to hit near the hoop
      const t = 35; // Time steps
      s.ball.vx = dx / t;
      const gravity = 0.3;
      s.ball.vy = (dy - 0.5 * gravity * t * t) / t + (0.5 - power) * 3;
      s.ball.flying = true;
      s.shots++;
      playJump();
    };

    const handleShoot = (e) => {
      if (e) e.preventDefault();
      shoot();
    };
    
    const handleKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        shoot();
      }
    };

    canvas.addEventListener('click', handleShoot);
    canvas.addEventListener('touchstart', handleShoot, { passive: false });
    window.addEventListener('keydown', handleKey);

    const loop = () => {
      const s = stateRef.current;
      if (!s) return;
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = '#1a0a2e';
      ctx.fillRect(0, 0, W, H);

      // Simple court lines
      ctx.strokeStyle = 'rgba(179,157,219,0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, H - 40);
      ctx.lineTo(W, H - 40);
      ctx.stroke();

      // Defender movement
      const defX = 170;
      s.defenderPhase += 0.05;
      // Sink lower before going up (shifted sin wave)
      s.defenderY = (H / 2 + 40) + Math.sin(s.defenderPhase) * 80;

      // Power bar oscillation
      if (s.aiming) {
        s.power += 0.02 * s.powerDir;
        if (s.power >= 1 || s.power <= 0) s.powerDir *= -1;

        // Trajectory preview
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(255,107,157,0.3)';
        ctx.beginPath();
        ctx.moveTo(s.ball.x, s.ball.y);
        let px = s.ball.x, py = s.ball.y;
        let pvx = s.ball.vx || (HOOP_X - s.ball.x) / 35;
        let pvy = s.ball.vy || ((HOOP_Y - s.ball.y) - 0.5 * 0.3 * 35 * 35) / 35 + (0.5 - s.power) * 3;
        for (let i = 0; i < 40; i++) {
          px += pvx;
          pvy += 0.3;
          py += pvy;
          ctx.lineTo(px, py);
          if (py > H) break;
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Physics
      if (s.ball.flying) {
        s.ball.vy += 0.3; // gravity
        s.ball.x += s.ball.vx;
        s.ball.y += s.ball.vy;

        // Defender collision
        const dDistX = Math.abs(s.ball.x - defX);
        const dDistY = Math.abs(s.ball.y - s.defenderY + 15); // Adjusted center
        if (dDistX < 18 && dDistY < 35 && !s.scored && !s.missed) {
          // Intercepted!
          s.ball.vx = -Math.abs(s.ball.vx) * 0.5;
          s.ball.vy = -3;
          playWrong();
          s.missed = true;
          // Particles on block
          for (let i = 0; i < 5; i++) {
             s.particles.push({
               x: s.ball.x, y: s.ball.y,
               vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
               life: 20, size: 5, color: '#69f0ae'
             });
          }
        }

        // Scoring logic
        const dist = Math.hypot(s.ball.x - HOOP_X, s.ball.y - HOOP_Y);
        if (dist < HOOP_R && s.ball.vy > 0 && !s.scored && !s.missed) {
          if (Math.abs(s.ball.x - HOOP_X) < HOOP_R - 5) {
            s.scored = true;
            s.score++;
            playCorrect();
            for (let i = 0; i < 15; i++) {
              s.particles.push({
                x: HOOP_X, y: HOOP_Y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 40, size: 8,
                color: ['#ff6b9d','#ffd54f','#b39ddb'][i % 3],
              });
            }
          } else {
            s.ball.vx *= -0.6;
            s.ball.vy *= -0.5;
            playWrong();
          }
        }

        if (s.ball.y > H - 20 || s.ball.x > W + 20 || s.ball.x < -20) {
          s.ball.flying = false;
          s.missed = true;
        }
      }

      // Settle and reset/end
      if (!s.ball.flying && !s.aiming) {
        s.settle++;
        if (s.settle > 50) {
          if (s.shots >= MAX_SHOTS && !doneRef.current) {
            doneRef.current = true;
            setTimeout(() => {
              if (s.score >= NEEDED_SCORE) {
                playCorrect();
                onWin();
              } else {
                playFail();
                onFail();
              }
            }, 400);
          } else if (s.shots < MAX_SHOTS) {
            reset();
          }
        }
      }

      // Draw particles
      s.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--;
        drawHeart(ctx, p.x, p.y, p.size, p.color, p.life / 40);
      });
      s.particles = s.particles.filter(p => p.life > 0);

      // Draw Defender
      drawDefender(ctx, defX, s.defenderY);

      // Draw Hoop
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(HOOP_X, HOOP_Y, HOOP_R, 0, Math.PI, false); // Bottom half of hoop
      ctx.stroke();
      
      // Draw Backboard
      ctx.fillStyle = '#7e57c2';
      ctx.fillRect(HOOP_X + HOOP_R, HOOP_Y - 60, 8, 100);

      // Draw Ball
      drawHeart(ctx, s.ball.x, s.ball.y, BALL_RADIUS * 2, '#ff6b9d');

      // Draw top half of hoop (so ball goes "through" it)
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(HOOP_X, HOOP_Y, HOOP_R, Math.PI, Math.PI * 2, false);
      ctx.stroke();

      // UI Text
      if (s.aiming) {
        ctx.fillStyle = '#2d1b4e';
        ctx.fillRect(20, H - 30, 120, 12);
        ctx.fillStyle = s.power > 0.8 ? '#ff5252' : s.power > 0.4 ? '#ffd54f' : '#69f0ae';
        ctx.fillRect(22, H - 28, 116 * s.power, 8);
        ctx.strokeStyle = '#ffb3d1';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, H - 30, 120, 12);
        
        ctx.fillStyle = 'white';
        ctx.font = '7px "Press Start 2P"';
        ctx.fillText('SPACE/CLICK to shoot!', 150, H - 20);
      }

      ctx.fillStyle = '#ffd54f';
      ctx.font = '9px "Press Start 2P"';
      ctx.fillText(`Score: ${s.score}/${MAX_SHOTS}`, 10, 30);
      ctx.fillStyle = '#ff6b9d';
      ctx.fillText(`Shots: ${s.shots}/${MAX_SHOTS}`, 10, 50);
      ctx.fillStyle = '#b39ddb';
      ctx.font = '7px "Press Start 2P"';
      ctx.fillText(`Need ${NEEDED_SCORE} to win`, 10, 70);

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('click', handleShoot);
      canvas.removeEventListener('touchstart', handleShoot);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 16 }}>
      <div style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: 'var(--pink)' }}>
        Heart Basketball 🏀
      </div>
      <div style={{ fontFamily: 'var(--pixel)', fontSize: 7, color: 'var(--purple)', textAlign: 'center' }}>
        Wait for the right power · Aim for the hoop!
      </div>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          border: '3px solid var(--gold)',
          borderRadius: 8,
          boxShadow: '0 0 20px rgba(255,213,79,0.2)',
          backgroundColor: '#1a0a2e',
          cursor: 'pointer',
          touchAction: 'none',
          maxWidth: '100%',
        }}
      />
    </div>
  );
}

export default HeartBasketball;
