import React, { useEffect, useRef } from 'react';

function QuizBackground() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const colors = ['#ff6b9d','#ffb3d1','#b39ddb','#ffd54f','#ff8a65','#80deea','#a5d6a7'];
    const shapes = ['heart', 'rect', 'circle'];

    // Slow confetti (less particles, slower speed)
    particlesRef.current = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1,
      vy: 0.3 + Math.random() * 1.2, // Slower than active confetti
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      size: 4 + Math.random() * 6,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 2,
      opacity: 0.5, // Slightly transparent
    }));

    let ufoObj = null;
    let ufoTimer = setTimeout(spawnUFO, 3000 + Math.random() * 5000);

    function spawnUFO() {
      const fromLeft = Math.random() > 0.5;
      ufoObj = {
        x: fromLeft ? -100 : canvas.width + 100,
        y: 40 + Math.random() * (canvas.height / 3),
        vx: fromLeft ? 1.5 + Math.random() * 1.5 : -(1.5 + Math.random() * 1.5),
        vy: (Math.random() - 0.5) * 0.3,
        wobble: 0
      };
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw confetti
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === 'heart') {
          const s = p.size / 2;
          ctx.beginPath();
          ctx.moveTo(0, s);
          ctx.bezierCurveTo(s, -s/2, s*2, s/2, 0, s*2);
          ctx.bezierCurveTo(-s*2, s/2, -s, -s/2, 0, s);
          ctx.fill();
        } else if (p.shape === 'rect') {
          ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size/2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Draw UFO
      if (ufoObj) {
        ufoObj.x += ufoObj.vx;
        ufoObj.y += ufoObj.vy;
        ufoObj.wobble += 0.05;
        const wy = Math.sin(ufoObj.wobble) * 8;

        ctx.save();
        ctx.translate(ufoObj.x, ufoObj.y + wy);

        // Draw alien in dome
        ctx.fillStyle = 'rgba(150, 255, 150, 0.7)';
        ctx.beginPath();
        ctx.arc(0, -6, 10, 0, Math.PI, true);
        ctx.fill();
        
        // Alien head
        ctx.fillStyle = '#69f0ae';
        ctx.beginPath();
        ctx.arc(0, -5, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw UFO body
        ctx.fillStyle = '#b39ddb';
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#7e57c2';
        ctx.stroke();

        // Draw flashing lights
        const t = Date.now();
        ctx.fillStyle = t % 600 < 300 ? '#ffeb3b' : '#ff5252';
        ctx.beginPath();
        ctx.arc(-12, 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = t % 800 < 400 ? '#00e676' : '#29b6f6';
        ctx.beginPath();
        ctx.arc(0, 4, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = t % 500 < 250 ? '#ff5252' : '#ffeb3b';
        ctx.beginPath();
        ctx.arc(12, 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Check if out of bounds
        if ((ufoObj.vx > 0 && ufoObj.x > canvas.width + 100) || 
            (ufoObj.vx < 0 && ufoObj.x < -100)) {
          ufoObj = null;
          ufoTimer = setTimeout(spawnUFO, 6000 + Math.random() * 10000);
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      clearTimeout(ufoTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.8
      }}
    />
  );
}

export default QuizBackground;
